import { interval, startWith, Subject, takeUntil } from 'rxjs';
import { Injectable } from '@app/core/di';
import { State } from '@app/state';
import { INode } from '@app/models';
import { TRAFFIC_LIGHT_CYCLE } from '../constants';

@Injectable([State])
export class TrafficLightsManager {
    private _destroy$: Subject<void> = new Subject<void>();

    constructor(private _state: State) { }

    public start(simNodes: INode[]): void {
        this._destroy$.next();
        this._destroy$.complete();
        this._destroy$ = new Subject<void>();

        for (const node of simNodes) {
            if (node.connectedRoads.length >= 3) {
                let state = 0;

                const updateState = () => {
                    switch (state) {
                        case 0:
                            node.horizontalLightId = 0; // green
                            node.verticalLightId = 2;   // red
                            break;
                        case 1:
                            node.horizontalLightId = 1; // yellow
                            node.verticalLightId = 1;   // yellow
                            break;
                        case 2:
                            node.horizontalLightId = 2; // red
                            node.verticalLightId = 0;   // green
                            break;
                        case 3:
                            node.horizontalLightId = 1; // yellow
                            node.verticalLightId = 1;   // yellow
                            break;
                    }

                    const cr = this._state.crossroads.find(c => c.x === node.x && c.y === node.y);
                    if (cr) {
                        cr.horizontalLightId = node.horizontalLightId;
                        cr.verticalLightId = node.verticalLightId;
                    }

                    state = (state + 1) % 4;
                };

                interval(Math.random() * 1000 + TRAFFIC_LIGHT_CYCLE)
                    .pipe(startWith(0), takeUntil(this._destroy$))
                    .subscribe(updateState);
            }
        }
    }

    public stop(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }
}
