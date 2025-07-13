import { NotificationType } from './notification-type.enum';
import { BaseAppNotification } from './notification.interface';

export class RedoNotification extends BaseAppNotification {
    public readonly type = NotificationType.Info;

    constructor() {
        super();
        this.message = 'Redo last action';
    }
}