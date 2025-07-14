import { Injectable } from '@app/core/di';
import { UserEventsService } from '@app/core/services';
import { AppMode, UserActionEvent } from '@app/models';
import { ModeChangedNotification, NotificationService } from '@app/notifications';
import { State } from '@app/state';
import { EditModeService } from 'features/+edit-mode/edit-mode.service';
import { SimulationModeService } from 'features/+simulation-mode/simulation-mode.service';

@Injectable([
    State,
    EditModeService,
    SimulationModeService,
    UserEventsService,
    NotificationService,
])
export class AppModeService {
    constructor(
        private readonly _state: State,
        private readonly _editMode: EditModeService,
        private readonly _simulationMode: SimulationModeService,
        private readonly _userEventsService: UserEventsService,
        private readonly _notifications: NotificationService
    ) { }

    public setMode(mode: AppMode): void {
        const current = this._state.mode$.getValue();

        if (mode === AppMode.Edit) {
            this._simulationMode.stop();
            this._editMode.run();
        } else {
            this._editMode.stop();
            this._simulationMode.run();
        }
        
        if (current === mode) return;
        
        this._state.mode$.next(mode);
        this._notifications.add(new ModeChangedNotification(mode));
    }

    public init() {
        this.setMode(AppMode.Edit);

        this._userEventsService.onActionEvent(UserActionEvent.EnableEditMode).subscribe(() => {
            this.setMode(AppMode.Edit);
        });

        this._userEventsService.onActionEvent(UserActionEvent.EnableSimulationMode).subscribe(() => {
            this.setMode(AppMode.Simulation);
        });
    }
}
