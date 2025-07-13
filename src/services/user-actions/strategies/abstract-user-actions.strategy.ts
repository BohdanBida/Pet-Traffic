import { State } from '@app/state';
import { NotificationService } from '@app/notifications';
import { UserEventsService, UserInputService } from '@app/core/services';

export abstract class AbstractUserActionsStrategy {
    protected abstract readonly state: State;

    protected abstract readonly canvas: HTMLCanvasElement;

    protected abstract readonly notificationService: NotificationService;

    protected abstract readonly userInputService: UserInputService;

    protected abstract readonly userEventsService: UserEventsService;

    public abstract onMouseDown(e: MouseEvent): void;

    public abstract onMouseMove(e: MouseEvent): void;

    public abstract onMouseUp(e: MouseEvent): void;
}