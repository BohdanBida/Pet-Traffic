import { ITemplateData } from '@app/models';
import { FileHelper, HTMLElementBuilder, JsonValidationHelper } from '@app/helpers';
import { BasePopupComponent } from '../base-popup-component';
import { EXAMPLE_MAP_STATE1, EXAMPLE_MAP_STATE2, EXAMPLE_MAP_STATE3 } from '@app/examples';
import { TemplatePreviewComponent } from 'components/template-preview';

const LAST_FILE_KEY = 'lastUploadedTemplate';

export class SelectTemplateComponent extends BasePopupComponent<ITemplateData> {
    protected createElement(): HTMLDivElement {
        const buttons: (HTMLButtonElement | HTMLInputElement)[] = [
            this._createTemplateOption(EXAMPLE_MAP_STATE1),
            this._createTemplateOption(EXAMPLE_MAP_STATE2),
            this._createTemplateOption(EXAMPLE_MAP_STATE3),
        ];

        if (localStorage.getItem(LAST_FILE_KEY)) {
            buttons.push(this._createLastUploadedFileOption());
        }

        buttons.push(this._createFileInputElement(
            this._onSelectFile.bind(this)
        ));

        return new HTMLElementBuilder('div')
            .setClass('select-example-container')
            .setChildren(buttons)
            .build();
    }

    private _createTemplateOption(data: ITemplateData, customName?: string): HTMLButtonElement {
        const canvas = new TemplatePreviewComponent(data).getElement();

        const label = new HTMLElementBuilder('span')
            .setClass(`select-example-text ${customName ? 'custom-name' : ''}`)
            .setText(customName ?? data.name)
            .build();

        return new HTMLElementBuilder('button')
            .setClass('select-example-button')
            .setChildren([canvas, label])
            .onClick(() => this.close(data))
            .build();
    }

    private _createFileInputElement(callback: (data: ITemplateData) => void): HTMLInputElement {
        const input = document.createElement('input');
        input.classList.add('select-example-file');
        input.type = 'file';
        input.accept = '.json';

        FileHelper.readJSON<ITemplateData>(input).subscribe(callback);

        return input;
    }

    private _onSelectFile(data: ITemplateData): void {
        JsonValidationHelper.validate(data);
        localStorage.setItem(LAST_FILE_KEY, JSON.stringify(data));
        this.close(data);
    }

    private _createLastUploadedFileOption(): HTMLButtonElement {
        const raw = localStorage.getItem(LAST_FILE_KEY);
        let data: ITemplateData | null = null;

        try {
            if (raw) data = JSON.parse(raw);
            JsonValidationHelper.validate(data);
        } catch {
            data = null;
        }

        if (!data) {
            const button = new HTMLElementBuilder('button')
                .setClass('select-example-button')
                .setText('Invalid Last Uploaded File')
                .build();

            button.disabled = true;
            return button;
        }

        return this._createTemplateOption(data, 'Last Uploaded File');
    }
}
