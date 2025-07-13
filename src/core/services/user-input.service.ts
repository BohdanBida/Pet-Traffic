import { BehaviorSubject, fromEvent, Observable } from 'rxjs';
import { IPoint } from '../../models';
import { Injectable } from '@app/core/di';

@Injectable([HTMLCanvasElement])
export class UserInputService {
    public mousePosition$: BehaviorSubject<IPoint | null> = new BehaviorSubject<IPoint | null>(null);

    public get mousePosition(): IPoint | null {
        return this.mousePosition$.getValue();
    }

    public readonly mouseDown$: Observable<MouseEvent>;

    public readonly mouseMove$: Observable<MouseEvent>;

    public readonly mouseUp$: Observable<MouseEvent>;
    
    public readonly mouseLeave$: Observable<MouseEvent>;

    constructor(private target: HTMLCanvasElement) {
        this.mouseDown$ = fromEvent<MouseEvent>(this.target, 'mousedown');
        this.mouseMove$ = fromEvent<MouseEvent>(this.target, 'mousemove');
        this.mouseUp$ = fromEvent<MouseEvent>(this.target, 'mouseup');
        this.mouseLeave$ = fromEvent<MouseEvent>(this.target, 'mouseleave');
    }
}