import { Injector } from '@app/core/di';
import { DebugNotification } from './notifications/debug.notification.ts';
import { NotificationService } from '@app/notifications';

const notificationService = Injector.resolve(NotificationService);

export function overrideConsoleLog() {
    const original = console.log.bind(console);
    console.log = (...args: any[]) => {
        original(...args);
        notificationService.add(new DebugNotification(...args));
    };
}
