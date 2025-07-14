import { NotificationType } from './notification-type.enum';
import { BaseAppNotification } from './notification.interface';

export class TemplateSelectedNotification extends BaseAppNotification {
    public readonly type = NotificationType.Info;

    constructor(private name: string) {
        super();

        this.message = `Set Template: '${this.name}'`;
    }
}