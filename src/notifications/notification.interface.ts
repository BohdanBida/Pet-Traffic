import { NotificationType } from './notification-type.enum';

export abstract class BaseAppNotification {
    public message!: string;

    public abstract type: NotificationType;

    public timestamp: string;

    constructor() {
        const now = new Date();
        const timeBase = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
        const ms = now.getMilliseconds().toString().padStart(3, '0');

        this.timestamp = `${timeBase}.${ms}`;
    }
}   