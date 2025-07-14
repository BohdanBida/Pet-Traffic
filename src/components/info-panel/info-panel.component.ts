import { UserInputService } from '@app/core/services';
import { Injectable } from '@app/core/di';
import { Component } from '../component';
import { State } from '@app/state';
import { HTMLElementBuilder } from '@app/helpers';
import { IPoint } from '@app/models';
import { filter, takeUntil } from 'rxjs';
import { FpsChartComponent } from './fps-chart/fps-chart.component';

@Injectable([State, UserInputService])
export class InfoPanelComponent extends Component<HTMLSpanElement> {
  constructor(
    private _state: State,
    private _userInputService: UserInputService
  ) {
    super();
  }

  protected createElement(): HTMLSpanElement {
    const mouseCoordinatesElement = this._createMouseCoordinatesElement();
    const fpsElement = this._createFPSElement();

    return new HTMLElementBuilder('span')
      .setClass('info-panel-container')
      .setChildren([
        mouseCoordinatesElement,
        fpsElement,
      ])
      .build();
  }

  private _createMouseCoordinatesElement(): HTMLSpanElement {
    const labelElement = this._createLabelElement('Mouse Coordinates: ');
    const valueElement = this._createValueElement(this._getValue(null));

    this._userInputService.mousePosition$
      .pipe(takeUntil(this.destroy$))
      .subscribe((coords: IPoint | null) => {
        valueElement.textContent = this._getValue(coords);
      });

    this._state.adjustByObjectsMode$
      .pipe(takeUntil(this.destroy$))
      .subscribe((value: boolean) => {
        valueElement.classList.toggle('adjust-by-objects', value);
      });

    return new HTMLElementBuilder('span')
      .setClass('mouse-coordinates-container')
      .setChildren([
        labelElement,
        valueElement,
      ])
      .build();
  }

  private _createFPSElement(): HTMLSpanElement {
    const labelElement = this._createLabelElement('FPS: ');
    const valueElement = this._createValueElement('0');

    const chartComponent = new FpsChartComponent(80, 20);

    this._state.fps$
      .pipe(
        filter(Boolean),
        takeUntil(this.destroy$)
      ).subscribe((fps: number) => {
        valueElement.textContent = fps.toFixed(2);
        chartComponent.update(fps);
      });

    return new HTMLElementBuilder('span')
      .setClass('fps-container')
      .setChildren([
        labelElement,
        valueElement,
        chartComponent.getElement(),
      ])
      .build();
  }

  private _createLabelElement(text: string): HTMLSpanElement {
    return new HTMLElementBuilder('span')
      .setClass('label')
      .setText(text)
      .build();
  }

  private _createValueElement(value: string): HTMLSpanElement {
    return new HTMLElementBuilder('span')
      .setClass('value')
      .setText(value)
      .build();
  }

  private _getValue(point: IPoint | null): string {
    return point ? `(${point.x}, ${point.y})` : 'N/A';
  }
}
