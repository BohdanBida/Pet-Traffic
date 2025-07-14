import { ITemplateData } from '@app/models';
import { HTMLHelper, JsonValidationHelper } from '@app/helpers';
import { BasePopupComponent } from '../base-popup-component';
import { EXAMPLE_MAP_STATE1, EXAMPLE_MAP_STATE2, EXAMPLE_MAP_STATE3 } from '@app/examples';
import { TemplatePreviewComponent } from 'components/template-preview';

const LAST_FILE_KEY = 'lastUploadedTemplate';

export class SelectTemplateComponent extends BasePopupComponent<ITemplateData> {

    protected createElement(): HTMLDivElement {
        const templateOptions = [
            EXAMPLE_MAP_STATE1,
            EXAMPLE_MAP_STATE2,
            EXAMPLE_MAP_STATE3,
        ].map((data: ITemplateData) => this._getTemplateOption(data));

        if (localStorage.getItem(LAST_FILE_KEY)) {
            templateOptions.push(this._getLastSelectedFileOption());
        }

        return HTMLHelper.createElement<HTMLDivElement>({
            tagName: 'div',
            className: 'select-example-container',
            children: [
                ...templateOptions,
                this._getSelectFileElement(),
            ],
        });
    }

    private _getTemplateOption(data: ITemplateData, customName?: string): HTMLButtonElement {
        const { name } = data;

        const canvas = new TemplatePreviewComponent(data).getElement();

        return HTMLHelper.createElement<HTMLButtonElement>({
            tagName: 'button',
            className: 'select-example-button',
            onClick: () => this.close(data),
            children: [
                canvas,
                HTMLHelper.createElement<HTMLSpanElement>({
                    tagName: 'span',
                    className: `select-example-text ${customName ? 'custom-name' : ''}`,
                    textContent: customName ?? name,
                }),
            ]
        });
    }


    private _getSelectFileElement(): HTMLInputElement {
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
            } catch {
                throw new Error('Parsing Failed: Invalid JSON format');
            }

            JsonValidationHelper.validate(json);

            localStorage.setItem(
                LAST_FILE_KEY,
                JSON.stringify(json)
            );

            this.close(json);
        };

        reader.onerror = () => {
            throw new Error('Error reading file');
        };

        reader.readAsText(file);
    }

    private _getLastSelectedFileOption(): HTMLButtonElement {
        const raw = localStorage.getItem(LAST_FILE_KEY);

        let data: ITemplateData | null = null;

        try {
            if (raw) {
                data = JSON.parse(raw);
            }

            JsonValidationHelper.validate(data)
        } catch {
            data = null;
        }


        if (!data) {
            const button = HTMLHelper.createElement<HTMLButtonElement>({
                tagName: 'button',
                className: 'select-example-button',
                textContent: 'Invalid Last Uploaded File',
            });
            button.disabled = true;

            return button;
        }

        return this._getTemplateOption(data, 'Last Uploaded File');
    }

}