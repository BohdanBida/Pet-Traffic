import { Subject, takeUntil } from 'rxjs';
import { Injectable } from '@app/core/di';
import { AppMode, IExampleData, IRoad, UserActionEvent } from '@app/models';
import { State } from '@app/state';
import { RoadHelper } from '@app/helpers';
import { UserEventsService } from '@app/core/services';
import { RoadDrawnNotification, NotificationService, ExampleSelectedNotification } from '@app/notifications';
import { EXAMPLE_MAP_STATE1 } from '@app/examples';
import { StateHistoryManager } from '@app/core/history';
import { v4 as uuid } from 'uuid';
import { EditTrafficLightsManager } from './managers';

@Injectable([
    State,
    EditTrafficLightsManager,
    StateHistoryManager,
    NotificationService,
    UserEventsService,
])
export class EditModeService {
    private _destroy$: Subject<void> = new Subject<void>();

    constructor(
        private readonly _state: State,
        private readonly _traffic: EditTrafficLightsManager,
        private readonly _stateHistoryManager: StateHistoryManager,
        private readonly _notificationService: NotificationService,
        private readonly _userEventsService: UserEventsService,
    ) { }

    public run(): void {
        this._state.mode$.next(AppMode.Edit);

        this._destroy$ = new Subject<void>();

        this._traffic.start();

        this._userEventsService.onActionEvent<IRoad>(UserActionEvent.RoadAdded)
            .pipe(takeUntil(this._destroy$))
            .subscribe((road: IRoad) => this._addRoad(road));

        this._userEventsService.onActionEvent<IRoad>(UserActionEvent.RoadRemoved)
            .pipe(takeUntil(this._destroy$))
            .subscribe((road: IRoad) => this._removeRoad(road));

    }

    public stop(): void {
        this._state.inProgressRoad = null;
        this._destroy$.next();
        this._destroy$.complete();

        this._traffic.destroy();
    }

    public setExample(example: IExampleData): void {
        this._stateHistoryManager.save();
        this._state.updateState(example.state);
        this._notificationService.add(new ExampleSelectedNotification(example.name));
        this._setCrossroads();
    }

    private _addRoad(road: IRoad) {
        this._state.inProgressRoad = null;

        this._stateHistoryManager.save();

        this._state.roads.push({
            id: uuid(),
            ...road,
        });

        this._setCrossroads();

        this._notificationService.add(new RoadDrawnNotification(road));
    }

    private _removeRoad(road: IRoad) {
        this._stateHistoryManager.save();
        this._state.roads = this._state.roads.filter(r => r.id !== road.id);
        this._setCrossroads();
    }

    private _setCrossroads(): void {
        const { crossroads, turns } = RoadHelper.getCrossRoads(this._state.roads);
        this._state.crossroads = crossroads;
        this._state.turns = turns;

        this._traffic.start();
    }
}