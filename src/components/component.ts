import { Subject } from 'rxjs';

export abstract class Component<T = HTMLElement> {
    protected element: T | null = null;

    protected destroy$: Subject<void> = new Subject<void>();

    public getElement(): T {
        if (this.element) {
            return this.element;
        }

        this.element = this.createElement();

        return this.element;
    };

    public destroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        this.element = null;
    }

    protected abstract createElement(): T;
}
