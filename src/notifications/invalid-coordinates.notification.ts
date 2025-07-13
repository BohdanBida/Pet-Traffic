import { NotificationType } from './notification-type.enum';
import { BaseAppNotification } from './notification.interface';

export class InvalidCoordinatesNotification extends BaseAppNotification {
    public readonly type = NotificationType.Warning;

    constructor() {
        super();
        this.message = 'Invalid coordinates';
    }
}