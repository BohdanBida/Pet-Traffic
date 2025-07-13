import { NotificationType } from './notification-type.enum';
import { BaseAppNotification } from './notification.interface';

export class ExampleSelectedNotification extends BaseAppNotification {
    public readonly type = NotificationType.Info;

    constructor(private name: string) {
        super();

        this.message = `Set Example: '${this.name}'`;
    }
}