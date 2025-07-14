import { State } from '@app/state';
import { Injectable } from '@app/core/di';
import { UserEventsService } from '@app/core/services';
import { StateHistoryManager } from '@app/core/history';
import { PopupComponent, SelectTemplateComponent } from '@app/components';
import { UserInteractionsHandlerService, MainRenderProcessService } from '@app/services';
import { ClearNotification, ModeChangedNotification, NotificationService } from '@app/notifications';
import { AppMode, ITemplateData, UserActionEvent } from './models';
import { SimulationModeService } from './features/+simulation-mode/simulation-mode.service';
import { EditModeService } from './features/+edit-mode/edit-mode.service';

// TODO: Refactor, split responsibilities
@Injectable([
    State,
    StateHistoryManager,
    SimulationModeService,
    EditModeService,
    UserInteractionsHandlerService,
    MainRenderProcessService,
    UserEventsService,
    NotificationService,
])
export class App {
    constructor(
        private readonly _state: State,
        private readonly _stateHistoryManager: StateHistoryManager,
        private readonly _simulationService: SimulationModeService,
        private readonly _editModeService: EditModeService,
        private readonly _userInteractionsHandlerService: UserInteractionsHandlerService,
        private readonly _mainRenderProcessService: MainRenderProcessService,
        private readonly _userEventService: UserEventsService,
        private readonly _notificationService: NotificationService,
    ) {
        this.setMode(AppMode.Edit);

        this._userEventService.onActionEvent(UserActionEvent.EnableEditMode).subscribe(() => {
            this.setMode(AppMode.Edit);
        });

        this._userEventService.onActionEvent(UserActionEvent.EnableSimulationMode).subscribe(() => {
            this.setMode(AppMode.Simulation);
        });

        this._userEventService.onActionEvent(UserActionEvent.Clear).subscribe(() => {
            this.clear();
        });

        this._userEventService.onActionEvent(UserActionEvent.SetTemplate).subscribe(() => {
            const popup = new PopupComponent<ITemplateData>({
                title: 'Select Template',
                component: SelectTemplateComponent,
            });

            popup.open().subscribe((example?: ITemplateData) => {
                if (!example) return;

                this._editModeService.setTemplate(example);
            });
        });

        this._setupAdjustByObjectsModeListeners();
    }

    public init() {
        this._userInteractionsHandlerService.listenMouseEvents().subscribe();

        this._mainRenderProcessService.render();
    }

    public setMode(mode: AppMode) {
        const isChanged = this._state.mode$.getValue() !== mode;

        switch (mode) {
            case AppMode.Edit:
                this._simulationService.stop();
                this._editModeService.run();

                break;
            case AppMode.Simulation:
                this._editModeService.stop();
                this._simulationService.run();
                break;
        }

        if (isChanged) {
            this._notificationService.add(new ModeChangedNotification(mode));
        }
    }

    public clear() {
        this._stateHistoryManager.save();
        this._state.reset();
        this._notificationService.add(new ClearNotification());
    }

    private _setupAdjustByObjectsModeListeners() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Alt') {
                this._state.adjustByObjectsMode$.next(true);
            }
        });

        document.addEventListener('keyup', (e) => {
            e.preventDefault();

            if (e.key === 'Alt') {
                this._state.adjustByObjectsMode$.next(false);
            }
        });
    }
}