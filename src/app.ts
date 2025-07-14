import { State } from '@app/state';
import { Injectable } from '@app/core/di';
import { UserEventsService } from '@app/core/services';
import { StateHistoryManager } from '@app/core/history';
import { PopupComponent, SelectTemplateComponent } from '@app/components';
import { UserInteractionsHandlerService, MainRenderProcessService, AppModeService } from '@app/services';
import { ClearNotification, NotificationService } from '@app/notifications';
import { ITemplateData, UserActionEvent } from './models';
import { EditModeService } from './features/+edit-mode/edit-mode.service';

@Injectable([
    State,
    StateHistoryManager,
    EditModeService,
    UserInteractionsHandlerService,
    MainRenderProcessService,
    UserEventsService,
    NotificationService,
    AppModeService,
])
export class App {
    constructor(
        private readonly _state: State,
        private readonly _stateHistoryManager: StateHistoryManager,
        private readonly _editModeService: EditModeService,
        private readonly _userInteractionsHandlerService: UserInteractionsHandlerService,
        private readonly _mainRenderProcessService: MainRenderProcessService,
        private readonly _userEventService: UserEventsService,
        private readonly _notificationService: NotificationService,
        private readonly _appModeService: AppModeService,
    ) { }

    public init() {
        this._appModeService.init();

        this._userInteractionsHandlerService.listenMouseEvents().subscribe();
        this._userInteractionsHandlerService.listenKeyboardEvents().subscribe();

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

        this._mainRenderProcessService.render();
    }

    public clear() {
        this._stateHistoryManager.save();
        this._state.reset();
        this._notificationService.add(new ClearNotification());
    }
}