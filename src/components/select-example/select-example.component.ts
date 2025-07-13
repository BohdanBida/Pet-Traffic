import { IExampleData } from '@app/models';
import { HTMLHelper, JsonValidationHelper } from '@app/helpers';
import { BasePopupComponent } from '../base-popup-component';
import { EXAMPLE_MAP_STATE1, EXAMPLE_MAP_STATE2, EXAMPLE_MAP_STATE3 } from '@app/examples';

export class SelectExampleComponent extends BasePopupComponent<IExampleData> {
    protected createElement(): HTMLDivElement {
        return HTMLHelper.createElement<HTMLDivElement>({
            tagName: 'div',
            className: 'select-example-container',
            children: [
                ...this._getExampleOptions(),
                this._getInputElement(),
            ],
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

    private _getInputElement(): HTMLInputElement {
        const selectFileElement = document.createElement('input');

        selectFileElement.classList.add('select-example-file');
        selectFileElement.type = 'file';
        selectFileElement.accept = '.json';
        selectFileElement.onchange = (event: Event) => this._selectFile(event);

        return selectFileElement;
    }

    private _selectFile(event: Event): void {
        const input = event.target as HTMLInputElement;

        if (!input.files || input.files.length === 0) return;

        const file = input.files[0];
        const reader = new FileReader();

        reader.onload = () => {
            let json;

            try {
                json = JSON.parse(reader.result as string);
            } catch (error) {
                throw new Error('Parsing Failed: Invalid JSON format');
            }

            JsonValidationHelper.validate(json);

            this.close(json);
        };

        reader.onerror = () => {
            throw new Error('Error reading file');
        };

        reader.readAsText(file);
    }
}