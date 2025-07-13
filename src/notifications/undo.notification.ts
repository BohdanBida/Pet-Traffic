import { NotificationType } from './notification-type.enum';
import { BaseAppNotification } from './notification.interface';

export class UndoNotification extends BaseAppNotification {
    public readonly type = NotificationType.Info;

    constructor() {
        super();
        this.message = 'Undo last action';
    }
}