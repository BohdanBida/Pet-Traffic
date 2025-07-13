import { interval, Subject, takeUntil } from 'rxjs';
import { Injectable } from '@app/core/di';
import {
    ACCELERATION,
    CAR_LENGTH,
    CARS_AMOUNT,
    CROSSROAD_STOP_DISTANCE,
    DECELERATION,
    LANE_OFFSET,
    SAFE_DISTANCE,
} from './constants';
import { State } from '@app/state';
import { AppMode, INode, IRoadNode, Car } from '@app/models';
import { SimulationModeHelper } from './helpers';
import { TrafficLightsManager } from './managers';

@Injectable([State, TrafficLightsManager])
export class SimulationModeService {
    public simNodes: INode[] = [];

    public simRoads: IRoadNode[] = [];

    private _destroy$ = new Subject<void>();

    constructor(
        private readonly _state: State,
        private readonly _traffic: TrafficLightsManager,
    ) { }

    public convertEditToSim(): void {
        const [simNodes, simRoads] = SimulationModeHelper.convertEditToSim(this._state);
        this.simNodes = simNodes;
        this.simRoads = simRoads;
    }

    public run(): void {
        this._state.mode$.next(AppMode.Simulation);
        this.convertEditToSim();
        this._traffic.start(this.simNodes);
        this.init();

        this._destroy$.next();
        this._destroy$.complete();
        this._destroy$ = new Subject<void>();

        interval(1000 / 60).pipe(takeUntil(this._destroy$)).subscribe(() => this.step());
    }

    public stop(): void {
        this._state.cars = [];
        this._destroy$.next();
        this._destroy$.complete();
        this._traffic.destroy();
    }

    public init(): void {
        this._state.cars = [];
        const usedSpots = new Map<string, number[]>();

        let created = 0;
        let attempts = 0;
        while (created < CARS_AMOUNT && attempts < CARS_AMOUNT * 10) {
            attempts++;
            const road = this.simRoads[Math.floor(Math.random() * this.simRoads.length)];
            const direction = Math.random() > 0.5 ? 1 : -1;
            const t = direction === 1 ? 0 : 1;

            const nearby = (usedSpots.get(road.id) || []).some(existingT =>
                Math.abs(existingT - t) < (CAR_LENGTH + SAFE_DISTANCE) / this.getRoadLength(road)
            );

            if (nearby) continue;

            const speed = Math.random() * 0.001 + 0.004;
            const car = new Car(road, direction, t, speed);

            this.updateCarPosition(car);
            this._state.cars.push(car);
            created++;

            const roadSpots = usedSpots.get(road.id) || [];
            roadSpots.push(t);
            usedSpots.set(road.id, roadSpots);
        }
    }

    public step(): void {
        for (const car of this._state.cars) {
            const road = car.road;
            const node = car.direction === 1 ? road.endNode : road.startNode;

            const dx = road.endNode.x - road.startNode.x;
            const dy = road.endNode.y - road.startNode.y;
            const roadLength = Math.hypot(dx, dy);

            const isCrossroad = node.connectedRoads.length >= 3;
            const distanceToNode = roadLength * (car.direction === 1 ? (1 - car.t) : car.t);

            const isHorizontal = dx !== 0;
            const lightId = isHorizontal ? node.horizontalLightId : node.verticalLightId;
            const isRed = lightId === 2;
            const isYellow = lightId === 1;

            const isApproaching = distanceToNode <= CROSSROAD_STOP_DISTANCE;
            const isInside = distanceToNode < CROSSROAD_STOP_DISTANCE / 2;

            if (car.waiting) {
                if (lightId === 0 && this.isSafeToProceed(car)) {
                    car.waiting = false;
                    car.targetSpeed = car.speed;
                } else {
                    car.velocity = 0;
                    const stopT = CROSSROAD_STOP_DISTANCE / roadLength;
                    car.t = car.direction === 1 ? 1 - stopT : stopT;
                    this.updateCarPosition(car);
                    continue;
                }
            }

            if (!car.waiting && isCrossroad) {
                if ((isRed || (isYellow && !isInside)) && isApproaching) {
                    car.waiting = true;
                    car.velocity = 0;
                    car.targetSpeed = car.speed;
                    const stopT = CROSSROAD_STOP_DISTANCE / roadLength;
                    car.t = car.direction === 1 ? 1 - stopT : stopT;
                    this.updateCarPosition(car);
                    continue;
                } else if (isYellow && isApproaching && !isInside) {
                    car.targetSpeed = 0;
                }
            }

            if (!this.isSafeToProceed(car)) {
                car.targetSpeed = 0;
            } else {
                car.targetSpeed = car.speed;
            }

            if (car.velocity < car.targetSpeed) {
                car.velocity = Math.min(car.velocity + ACCELERATION, car.targetSpeed);
            } else if (car.velocity > car.targetSpeed) {
                car.velocity = Math.max(car.velocity - DECELERATION, car.targetSpeed);
            }

            car.t += car.velocity * car.direction;
            car.t = Math.max(0, Math.min(1, car.t));

            if (car.t <= 0 || car.t >= 1) {
                const node = car.direction === 1 ? road.endNode : road.startNode;
                const availableRoads = node.connectedRoads.filter(r => r !== road);

                if (availableRoads.length === 0 && node.connectedRoads.length < 3) {
                    // Dead-end and not a crossroad — try to turn back
                    const reverseDir = -car.direction;
                    const reverseT = car.t <= 0 ? 0 : 1;

                    const blocked = this._state.cars.some(other =>
                        other !== car &&
                        other.road === car.road &&
                        other.direction === reverseDir &&
                        Math.abs(other.t - reverseT) < (CAR_LENGTH + SAFE_DISTANCE) / this.getRoadLength(car.road)
                    );

                    if (!blocked) {
                        car.direction = reverseDir;
                        car.t = reverseT;
                        car.targetSpeed = car.speed;
                    } else {
                        // Stop and wait — only if not already inside the crossroad
                        const distanceToNode = this.getRoadLength(road) * (car.direction === 1 ? (1 - car.t) : car.t);
                        const isInsideCrossroad = distanceToNode < CROSSROAD_STOP_DISTANCE / 2;

                        if (!isInsideCrossroad) {
                            car.velocity = 0;
                            car.targetSpeed = 0;
                            const stopT = (CAR_LENGTH + SAFE_DISTANCE) / this.getRoadLength(road);
                            car.t = car.direction === 1 ? 1 - stopT : stopT;
                            this.updateCarPosition(car);
                            continue;
                        }
                    }

                    this.updateCarPosition(car);
                    continue;
                }

                // Proceed normally to next road
                const next = availableRoads[Math.floor(Math.random() * availableRoads.length)];
                if (next) {
                    const { direction, t } = this.getDirectionForNextRoad(node, next);
                    car.road = next;
                    car.direction = direction;
                    car.t = t;
                    car.targetSpeed = car.speed;
                }

                this.updateCarPosition(car);
                continue;
            }



            this.updateCarPosition(car);
        }
    }

    private updateCarPosition(car: Car): void {
        const { road, t } = car;
        const dx = road.endNode.x - road.startNode.x;
        const dy = road.endNode.y - road.startNode.y;

        car.x = road.startNode.x + dx * t;
        car.y = road.startNode.y + dy * t;
        car.angle = Math.atan2(dy, dx);
        if (car.direction === -1) car.angle += Math.PI;

        if (dx === 0) {
            car.x += ((dy > 0 && car.direction === 1) || (dy < 0 && car.direction === -1)) ? LANE_OFFSET : -LANE_OFFSET;
        } else if (dy === 0) {
            car.y += ((dx > 0 && car.direction === 1) || (dx < 0 && car.direction === -1)) ? -LANE_OFFSET : LANE_OFFSET;
        }
    }

    private getDirectionForNextRoad(node: INode, road: IRoadNode): { direction: 1 | -1; t: number } {
        if (road.startNode === node) return { direction: 1, t: 0 };
        if (road.endNode === node) return { direction: -1, t: 1 };
        console.warn(`Invalid road connection`);
        return { direction: 1, t: 0 };
    }

    private getRoadLength(road: IRoadNode): number {
        const dx = road.endNode.x - road.startNode.x;
        const dy = road.endNode.y - road.startNode.y;
        return Math.hypot(dx, dy);
    }

    private isSafeToProceed(car: Car): boolean {
        const roadLength = this.getRoadLength(car.road);
        const carsOnSameRoad = this._state.cars.filter(
            c => c.road === car.road && c !== car && c.direction === car.direction
        );

        const sorted = carsOnSameRoad.sort((a, b) =>
            car.direction === 1 ? a.t - b.t : b.t - a.t
        );

        for (const other of sorted) {
            const gap = (other.t - car.t) * car.direction;
            if (gap > 0 && gap < (CAR_LENGTH + SAFE_DISTANCE) / roadLength) {
                return false;
            }
        }

        return true;
    }
}
