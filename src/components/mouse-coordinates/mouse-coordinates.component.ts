import { UserInputService } from '@app/core/services';
import { Injectable } from '@app/core/di';
import { Component } from '../component';
import { State } from '@app/state';
import { HTMLHelper } from '@app/helpers';
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
    const label = HTMLHelper.createElement<HTMLSpanElement>({
      tagName: 'span',
      className: 'label'
    });
    label.textContent = 'Mouse Coordinates: ';

    const valueElement = HTMLHelper.createElement<HTMLSpanElement>({
      tagName: 'span',
      className: 'value',
      textContent: this._getValue(null)
    });

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

    return HTMLHelper.createElement<HTMLSpanElement>({
      tagName: 'span',
      className: 'mouse-coordinates-container',
      children: [label, valueElement]
    });
  }

  private _getValue(point: IPoint | null): string {
    return point ? `(${point.x}, ${point.y})` : 'N/A'
  }
}