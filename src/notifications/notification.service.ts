import { BehaviorSubject } from 'rxjs';
import { BaseAppNotification } from './notification.interface';

export class NotificationService {
    public events$: BehaviorSubject<BaseAppNotification[]> = new BehaviorSubject<BaseAppNotification[]>([]);

    private _cacheSize: number = 25;

    private _events: BaseAppNotification[] = [];

    public add(event: BaseAppNotification): void {
        this._events.unshift(event);

        if (this._events.length > this._cacheSize) {
            this._events.pop();
        }

        this.events$.next(this._events);
    }

    public setCacheSize(size: number): void {
        this._cacheSize = size;
        this._events = this._events.slice(-this._cacheSize);
        this.events$.next(this._events);
    }

    public clear(): void {
        this._events = [];
        this.events$.next(this._events);
    }
}