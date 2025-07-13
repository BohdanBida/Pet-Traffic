import { NotificationType } from './notification-type.enum';
import { BaseAppNotification } from './notification.interface';

export class IntersectionNotification extends BaseAppNotification {
    public readonly type = NotificationType.Warning;

    constructor() {
        super();
        this.message = 'Intersection detected';
    }
}