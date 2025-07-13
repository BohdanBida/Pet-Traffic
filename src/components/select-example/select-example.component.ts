import { IExampleData } from '@app/models';
import { HTMLHelper } from '@app/helpers';
import { BasePopupComponent } from '../base-popup-component';
import { EXAMPLE_MAP_STATE1, EXAMPLE_MAP_STATE2, EXAMPLE_MAP_STATE3 } from '@app/examples';

export class SelectExampleComponent extends BasePopupComponent<IExampleData> {
    protected createElement(): HTMLDivElement {
        return HTMLHelper.createElement<HTMLDivElement>({
            tagName: 'div',
            className: 'select-example-container',
            children: this._getExampleOptions(),
        });
    }

    private _getExampleOptions(): HTMLButtonElement[] {
        return [
            EXAMPLE_MAP_STATE1,
            EXAMPLE_MAP_STATE2,
            EXAMPLE_MAP_STATE3,
        ].map((data: IExampleData) => {
            const { name, imageName } = data;

            const imageElement = document.createElement('img');
            imageElement.src = `src/examples/${imageName}`;
            imageElement.classList.add('select-example-image');

            return HTMLHelper.createElement<HTMLButtonElement>({
                tagName: 'button',
                className: 'select-example-button',
                onClick: () => this.close(data),
                children: [
                    imageElement,
                    HTMLHelper.createElement<HTMLSpanElement>({
                        tagName: 'span',
                        className: 'select-example-text',
                        textContent: name,
                    }),
                ]
            });
        });
    }
}