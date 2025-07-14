import { Injectable } from '@app/core/di';
import { CROSSROAD_STOP_DISTANCE, CAR_LENGTH, SAFE_DISTANCE, DECELERATION } from '../constants';
import { Car } from '@app/models';
import { State } from '@app/state';
import { CarMovementManager } from './car-movement.manager';

@Injectable([State, CarMovementManager])
export class TrafficInteractionManager {
    constructor(
        private readonly _state: State,
        private readonly _carMovementManager: CarMovementManager,
    ) { }

    public shouldWaitForLight(car: Car): boolean {
        const road = car.road;
        const node = car.direction === 1 ? road.endNode : road.startNode;

        const dx = road.endNode.x - road.startNode.x;
        const isCrossroad = node.connectedRoads.length >= 3;
        const distanceToNode = this._getDistanceToNode(car);
        const isHorizontal = dx !== 0;
        const lightId = isHorizontal ? node.horizontalLightId : node.verticalLightId;
        const isRed = lightId === 2;
        const isYellow = lightId === 1;

        const isApproaching = distanceToNode <= CROSSROAD_STOP_DISTANCE;
        const isInside = distanceToNode < (CAR_LENGTH + SAFE_DISTANCE * 2);


        if (car.waiting) {
            if (lightId === 0 && this.isSafeToProceed(car)) {
                car.waiting = false;
                car.targetSpeed = car.speed;
            } else {
                car.velocity = 0;
                this._carMovementManager.updateCarPosition(car);
                return true;
            }
        }

        if (!car.waiting && isCrossroad) {
            if ((isRed || (isYellow && !isInside)) && isApproaching) {
                car.waiting = true;
                car.velocity = 0;
                car.targetSpeed = car.speed;
                this._carMovementManager.updateCarPosition(car);
                return true;
            } else if (isYellow && isApproaching && !isInside) {
                car.targetSpeed = 0;
            }
        }

        return false;
    }

    public isSafeToProceed(car: Car): boolean {
        const carsOnSameRoad = this._state.cars.filter(
            c => c.road === car.road && c !== car && c.direction === car.direction
        );

        const sorted = carsOnSameRoad.sort((a, b) =>
            car.direction === 1 ? a.movingProgress - b.movingProgress : b.movingProgress - a.movingProgress
        );

        const roadLength = car.road.length;
        const reactionTime = 100;
        const reactionDistance = car.velocity * reactionTime;
        const brakingDistance = (car.velocity ** 2) / DECELERATION;
        const dynamicSafeDistance = reactionDistance + brakingDistance + CAR_LENGTH + SAFE_DISTANCE;

        for (const other of sorted) {
            const gap = (other.movingProgress - car.movingProgress) * car.direction;
            if (gap > 0 && gap < dynamicSafeDistance / roadLength) {
                return false;
            }
        }

        return true;
    }

    private _getDistanceToNode(car: Car): number {
        return car.road.length * (car.direction === 1 ? (1 - car.movingProgress) : car.movingProgress);
    }
}
