import { HTMLElementBuilder } from '@app/helpers';
import { Injectable } from '@app/core/di';
import { App } from 'app';
import { Component } from '../component';
import { ControlsComponent } from '../controls';
import { LogPanelComponent } from '../log-panel';
import { InfoPanelComponent } from '../info-panel';

@Injectable([App, HTMLCanvasElement, ControlsComponent, LogPanelComponent, InfoPanelComponent])
export class AppComponent extends Component<HTMLDivElement> {
    constructor(
        private readonly _app: App,
        private readonly _canvas: HTMLCanvasElement,
        private readonly _controls: ControlsComponent,
        private readonly _logPanel: LogPanelComponent,
        private readonly _infoPanel: InfoPanelComponent,
    ) {
        super();

        this._app.init();
    }

    protected createElement(): HTMLDivElement {
        const components = [
            this._logPanel.getElement(),
            new HTMLElementBuilder('div')
                .setClass('canvas-container')
                .setChildren([
                    this._infoPanel.getElement(),
                    this._canvas,
                    this._controls.getElement()
                ])
                .build(),
        ];

        return new HTMLElementBuilder('div')
            .setClass('app-container')
            .setChildren(components)
            .build();
    }
}
