import { Injectable } from '@app/core/di';
import { CARS_AMOUNT, CAR_LENGTH, SAFE_DISTANCE } from '../constants';
import { Car, IRoadNode } from '@app/models';
import { State } from '@app/state';

@Injectable([State])
export class CarFactory {
    public initCars(state: State, roads: IRoadNode[]): void {
        state.cars = [];

        const usedSpots = new Map<string, number[]>();
        let attempts = 0;

        while (state.cars.length < CARS_AMOUNT && attempts < CARS_AMOUNT * 10) {
            attempts++;
            const road = roads[Math.floor(Math.random() * roads.length)];
            const direction = Math.random() > 0.5 ? 1 : -1;
            const movingProgress = direction === 1 ? 0 : 1;

            if (this.isSpotTaken(road.id, movingProgress, usedSpots, roads)) continue;

            const speed = Math.random() * 0.001 + 0.004;
            const car = new Car(road, direction, movingProgress, speed);
            state.cars.push(car);
            this.registerSpot(road.id, movingProgress, usedSpots);
        }
    }

    private isSpotTaken(roadId: string, movingProgress: number, usedSpots: Map<string, number[]>, roads: IRoadNode[]): boolean {
        return (usedSpots.get(roadId) || []).some(existingT =>
            Math.abs(existingT - movingProgress) < (CAR_LENGTH + SAFE_DISTANCE) / roads.find(r => r.id === roadId)!.length
        );
    }

    private registerSpot(roadId: string, movingProgress: number, usedSpots: Map<string, number[]>): void {
        const roadSpots = usedSpots.get(roadId) || [];
        roadSpots.push(movingProgress);
        usedSpots.set(roadId, roadSpots);
    }
}
