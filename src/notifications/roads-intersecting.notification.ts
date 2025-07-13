import { NotificationType } from './notification-type.enum';
import { BaseAppNotification } from './notification.interface';

export class RoadIntersectingNotification extends BaseAppNotification {
    public readonly type = NotificationType.Warning;

    constructor() {
        super();
        this.message = 'Roads are intersecting.\nPlease adjust the road placement.';
    }
}