import { Injectable } from '@app/core/di';
import {
    ACCELERATION, DECELERATION, MAX_PX_PER_TICK,
    LANE_OFFSET, CAR_LENGTH, SAFE_DISTANCE
} from '../constants';
import { Car, INode, IRoadNode } from '@app/models';
import { TICKS_PER_SECOND } from '@app/constants';
import { State } from '@app/state';

@Injectable([State])
export class CarMovementManager {
    constructor(
        private readonly _state: State
    ) { }

    public step(car: Car): void {
        this._adjustVelocity(car);
        this._advanceCar(car);
        this.updateCarPosition(car);
    }

    public updateCarPosition(car: Car): void {
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

    private _adjustVelocity(car: Car): void {
        const roadLength = car.road.length;
        const maxProgressPerTick = MAX_PX_PER_TICK / (roadLength * TICKS_PER_SECOND);
        const cappedTargetSpeed = Math.min(car.targetSpeed, maxProgressPerTick);

        if (car.velocity < cappedTargetSpeed) {
            car.velocity = Math.min(car.velocity + ACCELERATION, cappedTargetSpeed);
        } else if (car.velocity > cappedTargetSpeed) {
            car.velocity = Math.max(car.velocity - DECELERATION, cappedTargetSpeed);
        }
    }

    private _advanceCar(car: Car): void {
        const earlyTurnZone = 0.9;
        const isNearEnd = car.direction === 1 ? car.movingProgress >= earlyTurnZone : car.movingProgress <= 1 - earlyTurnZone;

        if (!car.nextRoad && isNearEnd) {
            const node = car.direction === 1 ? car.road.endNode : car.road.startNode;
            const options = node.connectedRoads.filter(r => r !== car.road);

            for (const next of options) {
                const { direction, movingProgress } = this._getDirectionForNextRoad(node, next);
                const isBlocked = this._state.cars.some(other =>
                    other.road === next &&
                    other.direction === direction &&
                    Math.abs(other.movingProgress - movingProgress) < (CAR_LENGTH + SAFE_DISTANCE) / next.length
                );

                if (!isBlocked) {
                    car.nextRoad = next;
                    car.nextDirection = direction;
                    car.nextProgress = movingProgress;
                    break;
                }
            }
        }

        const isAtEnd = car.direction === 1 ? car.movingProgress >= 1 : car.movingProgress <= 0;
        if (isAtEnd) {
            if (car.nextRoad) {
                car.road = car.nextRoad;
                car.direction = car.nextDirection!;
                car.movingProgress = car.nextProgress!;
                car.targetSpeed = car.speed;
                car.nextRoad = undefined;
                car.nextDirection = undefined;
                car.nextProgress = undefined;
            } else {
                const reverseDir = -car.direction;
                const reverseProgress = car.movingProgress <= 0 ? 0 : 1;
                const isBlocked = this._state.cars.some(other =>
                    other !== car &&
                    other.road === car.road &&
                    other.direction === reverseDir &&
                    Math.abs(other.movingProgress - reverseProgress) < (CAR_LENGTH + SAFE_DISTANCE) / car.road.length
                );

                if (!isBlocked) {
                    car.direction = reverseDir;
                    car.movingProgress = reverseProgress;
                    car.targetSpeed = car.speed;
                } else {
                    car.targetSpeed = 0;
                }
            }
            return;
        }

        car.movingProgress += car.velocity * car.direction;
        car.movingProgress = Math.max(0, Math.min(1, car.movingProgress));
    }


    private _getDirectionForNextRoad(node: INode, road: IRoadNode): { direction: 1 | -1; movingProgress: number } {
        if (road.startNode === node) return { direction: 1, movingProgress: 0 };
        if (road.endNode === node) return { direction: -1, movingProgress: 1 };
        return { direction: 1, movingProgress: 0 };
    }
}
