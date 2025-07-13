import { IUserActionEvent, UserActionEvent } from '@app/models';
import { BehaviorSubject, filter, map, Observable } from 'rxjs';

export class UserEventsService {
    private _event$: BehaviorSubject<IUserActionEvent | null> = new BehaviorSubject<IUserActionEvent | null>(null);

    public sendActionEvent<T = unknown>(type: UserActionEvent, payload?: T): void {
        this._event$.next({
            type,
            payload,
        });
    }

    public onActionEvent<T = unknown>(type: UserActionEvent): Observable<T> {
        return this._event$.pipe(
            filter(Boolean),
            filter((event: IUserActionEvent) => event.type === type),
            map((event: IUserActionEvent) => event.payload as T),
        );
    }
}