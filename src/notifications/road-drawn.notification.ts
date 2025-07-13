import { IRoad } from '@app/models';
import { NotificationType } from './notification-type.enum';
import { BaseAppNotification } from './notification.interface';

export class RoadDrawnNotification extends BaseAppNotification {
    public readonly type: NotificationType = NotificationType.Info;

    constructor(road: IRoad) {
        super();
        this.message = `Road drawn from (${road.start.x}; ${road.start.y}) to (${road.end.x}; ${road.end.y})`;
    }
}