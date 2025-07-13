import { interval, map, startWith, Subject, takeUntil } from 'rxjs';
import { State } from '@app/state';
import { ICrossRoad } from '@app/models';
import { EDIT_MODE_TRAFFIC_LIGHT_SPEED } from '../constants';
import { Injectable } from '@app/core/di';

@Injectable([State])
export class EditTrafficLightsManager {
    private _destroy$: Subject<void> = new Subject<void>();

    constructor(private _state: State) { }

    public start(): void {
        this._destroy$.next();
        this._destroy$.complete();
        this._destroy$ = new Subject<void>();

        this._state.crossroads.forEach((crossRoad: ICrossRoad) => {
            interval(EDIT_MODE_TRAFFIC_LIGHT_SPEED).pipe(
                startWith(0),
                map(() => [
                    crossRoad.verticalLightId ?? 0,
                    crossRoad.horizontalLightId ?? 0
                ]),
                takeUntil(this._destroy$)
            ).subscribe(([verticalLightId, horizontalLightId]: number[]) => {
                crossRoad.verticalLightId = (verticalLightId + 1) % 4;
                crossRoad.horizontalLightId = (horizontalLightId + 1) % 4;
            });
        });
    }

    public destroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }
}