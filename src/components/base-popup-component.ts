import { BehaviorSubject, Observable, skip, take } from 'rxjs';
import { Component } from './component';

export abstract class BasePopupComponent<R = unknown> extends Component<HTMLDivElement> {
    private readonly _result$: BehaviorSubject<R | undefined> = new BehaviorSubject<R | undefined>(undefined);

    public readonly result$!: Observable<R | undefined>;

    constructor() {
        super();

        this.result$ = this._result$.pipe(skip(1), take(1));
    }

    protected close(result?: R): void {
        this._result$.next(result);

        if (this.element) {
            this.element.remove();
        }

        this.destroy();
    }
}