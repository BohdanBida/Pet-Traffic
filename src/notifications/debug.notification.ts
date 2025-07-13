import { NotificationType } from './notification-type.enum';
import { BaseAppNotification } from './notification.interface';

export class DebugNotification extends BaseAppNotification {
    public readonly type = NotificationType.Debug;

    constructor(...args: unknown[]) {
        super();
        this.message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ');
    }
}