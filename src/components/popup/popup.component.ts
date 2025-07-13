import { BehaviorSubject, Observable, skip } from 'rxjs';
import { Component } from '../component';
import { HTMLHelper } from '@app/helpers';
import { BasePopupComponent } from 'components/base-popup-component';

type Constructor<T = unknown> = new (...args: any[]) => T;

type IPopupOptions<R> = {
    title: string;
    textContent?: string;
    component?: Constructor<BasePopupComponent<R>>;
};

export class PopupComponent<R> extends Component<HTMLDivElement> {
    private _result$: BehaviorSubject<R | undefined> = new BehaviorSubject<R | undefined>(undefined);

    constructor(private _options: IPopupOptions<R>) {
        super();
    }

    public open(): Observable<R | undefined> {
        const element = this.getElement();

        document.body.appendChild(element);

        document.onkeydown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' || event.key === 'Enter') {
                this.close();
            }
        };

        return this._result$.pipe(skip(1));
    }

    public close(result?: R): void {
        this.getElement().remove();
        this._result$.next(result);
        this.destroy();
    }

    protected createElement(): HTMLDivElement {
        const overlay = HTMLHelper.createElement<HTMLDivElement>({
            tagName: 'div',
            className: 'popup-overlay',
            onClick: (e) => {
                if (e.target === overlay) this.close();
            }
        });

        const container = HTMLHelper.createElement<HTMLDivElement>({
            tagName: 'div',
            className: 'popup-container'
        });

        const header = HTMLHelper.createElement<HTMLDivElement>({
            tagName: 'h3',
            className: 'popup-header',
            textContent: this._options.title
        });

        const closeButton = HTMLHelper.createElement<HTMLButtonElement>({
            tagName: 'button',
            className: 'popup-close',
            onClick: () => this.close()
        });

        const innerComponent = this._options.component ? new this._options.component() : null;

        innerComponent?.result$.subscribe((result: unknown) => {
            this.close(result as R);
        });

        const body = HTMLHelper.createElement<HTMLDivElement>({
            tagName: 'div',
            className: 'popup-body',
            textContent: this._options.textContent ?? '',
            children: innerComponent ? [innerComponent.getElement()] : [],
        });

        header.appendChild(closeButton);
        container.appendChild(header);
        container.appendChild(body);
        overlay.appendChild(container);

        return overlay;
    }
}
