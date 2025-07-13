import { MIN_ROAD_DISTANCE } from 'constants';
import { NotificationType } from './notification-type.enum';
import { BaseAppNotification } from './notification.interface';

export class RoadTooShortNotification extends BaseAppNotification {
    public type: NotificationType = NotificationType.Warning;

    constructor(distance: number) {
        super();
        this.message = `Road too short. Current distance: ${distance}.\nShould be at least ${MIN_ROAD_DISTANCE}.`;
    }
}