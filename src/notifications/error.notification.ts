import { NotificationType } from './notification-type.enum';
import { BaseAppNotification } from './notification.interface';

export class ErrorNotification extends BaseAppNotification {
    public readonly type = NotificationType.Error;

    constructor(public readonly error: unknown) {
        super();

        if (error instanceof Error) {
            this.message = error.message;
        } else if (typeof error === 'string') {
            this.message = error;
        } else {
            this.message = 'An unknown error occurred';
        }
    }
}