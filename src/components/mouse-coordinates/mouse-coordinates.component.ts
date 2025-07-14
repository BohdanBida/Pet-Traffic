import { UserInputService } from '@app/core/services';
import { Injectable } from '@app/core/di';
import { Component } from '../component';
import { State } from '@app/state';
import { HTMLElementBuilder } from '@app/helpers';
import { IPoint } from '@app/models';
import { takeUntil } from 'rxjs';

@Injectable([State, UserInputService])
export class MouseCoordinatesComponent extends Component<HTMLSpanElement> {
  constructor(
    private _state: State,
    private _userInputService: UserInputService
  ) {
    super();
  }

  protected createElement(): HTMLSpanElement {
    const labelElement = this._createLabelElement();
    const valueElement = this._createValueElement();

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
      .setChildren([labelElement, valueElement])
      .build();
  }

  private _createLabelElement(): HTMLSpanElement {
    return new HTMLElementBuilder('span')
      .setClass('label')
      .setText('Mouse Coordinates: ')
      .build();
  }

  private _createValueElement(): HTMLSpanElement {
    return new HTMLElementBuilder('span')
      .setClass('value')
      .setText(this._getValue(null))
      .build();
  }

  private _getValue(point: IPoint | null): string {
    return point ? `(${point.x}, ${point.y})` : 'N/A';
  }
}
