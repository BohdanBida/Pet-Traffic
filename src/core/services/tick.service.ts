import { TICKS_PER_SECOND } from '@app/constants';
import { interval, Observable, Subject } from 'rxjs';

export class TickService {
    private _destroy$ = new Subject<void>();

    public start(): Observable<number> {
        this._destroy$ = new Subject<void>();

        return interval(1000 / TICKS_PER_SECOND);
    }

    public stop(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }
}
