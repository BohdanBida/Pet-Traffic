import { AppMode } from 'models/enums';
import { NotificationType } from './notification-type.enum';
import { BaseAppNotification } from './notification.interface';

export class ModeChangedNotification extends BaseAppNotification {
    public readonly type = NotificationType.Info;

    constructor(private _mode: AppMode) {
        super();

        this.message = `Current Mode: '${this._mode === AppMode.Edit ? 'Edit' : 'Simulation'}'`;
    }
}