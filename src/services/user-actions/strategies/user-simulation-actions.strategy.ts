import { Injectable } from '@app/core/di';
import { UserEventsService, UserInputService } from '@app/core/services';
import { NotificationService } from '@app/notifications';
import { State } from '@app/state';
import { AbstractUserActionsStrategy } from './abstract-user-actions.strategy';


@Injectable([State, HTMLCanvasElement, NotificationService, UserInputService, UserEventsService])
export class UserSimulationActionsStrategy extends AbstractUserActionsStrategy {
    constructor(
        protected readonly state: State,
        protected readonly canvas: HTMLCanvasElement,
        protected readonly notificationService: NotificationService,
        protected readonly userInputService: UserInputService,
        protected readonly userEventsService: UserEventsService,
    ) {
        super();
    }

    public onMouseDown(): void {
        // Should be declared
    }

    public onMouseMove(): void {
        // Should be declared
    }

    public onMouseUp(): void {
        // Should be declared
    }
}