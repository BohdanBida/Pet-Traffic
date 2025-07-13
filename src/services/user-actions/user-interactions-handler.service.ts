import { map, merge, Observable, tap } from 'rxjs';
import { Injectable } from '@app/core/di';
import { State } from '@app/state';
import { UserEventsService, UserInputService } from '@app/core/services';
import { NotificationService } from '@app/notifications';
import { AbstractUserActionsStrategy } from './strategies/abstract-user-actions.strategy';
import { AppMode } from '@app/models';
import { UserEditActionsStrategy, UserSimulationActionsStrategy } from './strategies';

@Injectable([State, UserInputService, HTMLCanvasElement, NotificationService, UserEventsService])
export class UserInteractionsHandlerService {
    private _strategy!: AbstractUserActionsStrategy;

    constructor(
        protected readonly state: State,
        protected readonly userInputService: UserInputService,
        protected readonly canvas: HTMLCanvasElement,
        protected readonly notificationService: NotificationService,
        protected readonly userEventsService: UserEventsService,
    ) {
        this.state.mode$.subscribe((mode: AppMode) => {
            if (mode === AppMode.Edit) {
                this._strategy = new UserEditActionsStrategy(state, canvas, notificationService, userInputService, userEventsService);
            } else {
                this._strategy = new UserSimulationActionsStrategy(state, canvas, notificationService, userInputService, userEventsService);
            }
        });
    }

    public listenMouseEvents(): Observable<void> {
        return merge(
            this.userInputService.mouseLeave$.pipe(tap(() => this.userInputService.mousePosition$.next(null))),
            this.userInputService.mouseDown$.pipe(
                tap((e: MouseEvent) => this._strategy.onMouseDown(e))
            ),
            this.userInputService.mouseMove$.pipe(
                tap((e: MouseEvent) => this._strategy.onMouseMove(e))
            ),
            this.userInputService.mouseUp$.pipe(
                tap((e: MouseEvent) => this._strategy.onMouseUp(e)),
            ),
        ).pipe(map(() => undefined));
    }
}