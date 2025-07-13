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
import { GeometryHelper } from 'helpers/geometry.helper';

@Injectable([State, TrafficLightsManager])
export class SimulationModeService {
    public simNodes: INode[] = [];
    public simRoads: IRoadNode[] = [];

    private _destroy$ = new Subject<void>();

    constructor(
        private readonly _state: State,
        private readonly _traffic: TrafficLightsManager,
    ) { }

    public run(): void {
        this.stop();

        this._state.mode$.next(AppMode.Simulation);

        this.convertEditToSim();

        this._traffic.start(this.simNodes);

        this.init();

        this._destroy$ = new Subject<void>();
        interval(1000 / 60).pipe(takeUntil(this._destroy$)).subscribe(() => this.step());
    }

    public stop(): void {
        this._state.cars = [];
        this._destroy$.next();
        this._destroy$.complete();
        this._traffic.destroy();
    }

    public convertEditToSim(): void {
        const [simNodes, simRoads] = SimulationModeHelper.buildNodes(this._state);
        this.simNodes = simNodes;
        this.simRoads = simRoads;
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
            const movingProgress = direction === 1 ? 0 : 1;

            if (this.isSpotTaken(road.id, movingProgress, usedSpots)) continue;

            const speed = Math.random() * 0.001 + 0.004;
            const car = new Car(road, direction, movingProgress, speed);

            this.updateCarPosition(car);
            this._state.cars.push(car);
            created++;
            this.registerSpot(road.id, movingProgress, usedSpots);
        }
    }

    public step(): void {
        for (const car of this._state.cars) {
            if (this.shouldWaitForLight(car)) continue;
            if (!this.isSafeToProceed(car)) {
                car.targetSpeed = 0;
            } else {
                car.targetSpeed = car.speed;
            }

            this.adjustVelocity(car);
            this.advanceCar(car);
            this.updateCarPosition(car);
        }
    }

    private adjustVelocity(car: Car): void {
        if (car.velocity < car.targetSpeed) {
            car.velocity = Math.min(car.velocity + ACCELERATION, car.targetSpeed);
        } else if (car.velocity > car.targetSpeed) {
            car.velocity = Math.max(car.velocity - DECELERATION, car.targetSpeed);
        }
    }

    private advanceCar(car: Car): void {
        car.movingProgress += car.velocity * car.direction;
        car.movingProgress = Math.max(0, Math.min(1, car.movingProgress));

        if (car.movingProgress <= 0 || car.movingProgress >= 1) {
            this.handleRoadTransition(car);
        }
    }

    private handleRoadTransition(car: Car): void {
        const road = car.road;
        const node = car.direction === 1 ? road.endNode : road.startNode;
        const availableRoads = node.connectedRoads.filter(r => r !== road);

        if (availableRoads.length === 0 && node.connectedRoads.length < 3) {
            const reverseDir = -car.direction;
            const reverseProgress = car.movingProgress <= 0 ? 0 : 1;

            const isAnotherRoadSideFulfilled = this._state.cars.some(other =>
                other !== car &&
                other.road === car.road &&
                other.direction === reverseDir &&
                Math.abs(other.movingProgress - reverseProgress) < (CAR_LENGTH + SAFE_DISTANCE) / car.road.length
            );

            if (!isAnotherRoadSideFulfilled) {
                car.direction = reverseDir;
                car.movingProgress = reverseProgress;
                car.targetSpeed = car.speed;
            } else {
                car.targetSpeed = 0;
            }

            return;
        }

        const next = availableRoads[Math.floor(Math.random() * availableRoads.length)];

        if (next) {
            const { direction, movingProgress } = this.getDirectionForNextRoad(node, next);
            car.road = next;
            car.direction = direction;
            car.movingProgress = movingProgress;
            car.targetSpeed = car.speed;
        }
    }

    private shouldWaitForLight(car: Car): boolean {
        const road = car.road;
        const node = car.direction === 1 ? road.endNode : road.startNode;

        const dx = road.endNode.x - road.startNode.x;
        const roadLength = GeometryHelper.getDistance(road.startNode, road.endNode);

        const isCrossroad = node.connectedRoads.length >= 3;
        const distanceToNode = this.getDistanceToNode(car);
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
                car.movingProgress = car.direction === 1 ? 1 - stopT : stopT;
                this.updateCarPosition(car);
                return true;
            }
        }

        if (!car.waiting && isCrossroad) {
            if ((isRed || (isYellow && !isInside)) && isApproaching) {
                car.waiting = true;
                car.velocity = 0;
                car.targetSpeed = car.speed;
                const stopT = CROSSROAD_STOP_DISTANCE / roadLength;
                car.movingProgress = car.direction === 1 ? 1 - stopT : stopT;
                this.updateCarPosition(car);
                return true;
            } else if (isYellow && isApproaching && !isInside) {
                car.targetSpeed = 0;
            }
        }

        return false;
    }

    private updateCarPosition(car: Car): void {
        const { road, movingProgress } = car;
        const dx = road.endNode.x - road.startNode.x;
        const dy = road.endNode.y - road.startNode.y;

        car.x = road.startNode.x + dx * movingProgress;
        car.y = road.startNode.y + dy * movingProgress;
        car.angle = Math.atan2(dy, dx);
        if (car.direction === -1) car.angle += Math.PI;

        if (dx === 0) {
            car.x += ((dy > 0 && car.direction === 1) || (dy < 0 && car.direction === -1)) ? LANE_OFFSET : -LANE_OFFSET;
        } else if (dy === 0) {
            car.y += ((dx > 0 && car.direction === 1) || (dx < 0 && car.direction === -1)) ? -LANE_OFFSET : LANE_OFFSET;
        }
    }

    private getDirectionForNextRoad(node: INode, road: IRoadNode): { direction: 1 | -1; movingProgress: number } {
        if (road.startNode === node) return { direction: 1, movingProgress: 0 };
        if (road.endNode === node) return { direction: -1, movingProgress: 1 };

        return { direction: 1, movingProgress: 0 };
    }

    private getDistanceToNode(car: Car): number {
        return car.road.length * (car.direction === 1 ? (1 - car.movingProgress) : car.movingProgress);
    }

    private isSafeToProceed(car: Car): boolean {
        const carsOnSameRoad = this._state.cars.filter(
            c => c.road === car.road && c !== car && c.direction === car.direction
        );

        const sorted = carsOnSameRoad.sort((a, b) =>
            car.direction === 1 ? a.movingProgress - b.movingProgress : b.movingProgress - a.movingProgress
        );

        for (const other of sorted) {
            const gap = (other.movingProgress - car.movingProgress) * car.direction;
            if (gap > 0 && gap < (CAR_LENGTH + SAFE_DISTANCE) / car.road.length) {
                return false;
            }
        }

        return true;
    }

    private isSpotTaken(roadId: string, movingProgress: number, usedSpots: Map<string, number[]>): boolean {
        return (usedSpots.get(roadId) || []).some(existingT =>
            Math.abs(existingT - movingProgress) < (CAR_LENGTH + SAFE_DISTANCE) / this.simRoads.find(r => r.id === roadId)!.length
        );
    }

    private registerSpot(roadId: string, movingProgress: number, usedSpots: Map<string, number[]>): void {
        const roadSpots = usedSpots.get(roadId) || [];
        roadSpots.push(movingProgress);
        usedSpots.set(roadId, roadSpots);
    }
}
