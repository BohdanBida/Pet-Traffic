import { BehaviorSubject, Observable, skip } from 'rxjs';
import { HTMLElementBuilder } from '@app/helpers';
import { BasePopupComponent } from 'components/base-popup-component';
import { Component } from '../component';

type Constructor<T = unknown> = new (...args: any[]) => T;

type IPopupOptions<R> = {
    title: string;
    textContent?: string;
    component: Constructor<BasePopupComponent<R>>;
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
        const innerComponent = new this._options.component();

        innerComponent.result$.subscribe((result: unknown) => {
            this.close(result as R);
        });

        const overlay = this._createOverlayElement();
        const container = this._createContainerElement();
        const header = this._createHeaderElement();
        const body = this._createBodyElement(innerComponent);

        header.appendChild(this._createCloseButton());
        container.appendChild(header);
        container.appendChild(body);
        overlay.appendChild(container);

        return overlay;
    }

    private _createOverlayElement(): HTMLDivElement {
        return new HTMLElementBuilder('div')
            .setClass('popup-overlay')
            .onClick((e: MouseEvent) => this._onClickOutside(e))
            .build();
    }

    private _createContainerElement(): HTMLDivElement {
        return new HTMLElementBuilder('div')
            .setClass('popup-container')
            .build();
    }

    private _createHeaderElement(): HTMLDivElement {
        return new HTMLElementBuilder('h3')
            .setClass('popup-header')
            .setText(this._options.title)
            .build();
    }

    private _createCloseButton(): HTMLButtonElement {
        return new HTMLElementBuilder('button')
            .setClass('popup-close')
            .onClick(() => this.close())
            .build();
    }

    private _createBodyElement(innerComponent: BasePopupComponent<R> | null): HTMLDivElement {
        const children = innerComponent ? [innerComponent.getElement()] : [];

        return new HTMLElementBuilder('div')
            .setClass('popup-body')
            .setText(this._options.textContent ?? '')
            .setChildren(children)
            .build();
    }

    private _onClickOutside(event: MouseEvent): void {
        const target = event.target as HTMLElement;

        if (target.classList.contains('popup-overlay')) {
            this.close();
        }
    }
}
