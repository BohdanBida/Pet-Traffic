import './styles/style.css';

import { Injector } from '@app/core/di';
import { initCanvas } from './init-canvas.ts';
import { AppComponent } from '@app/components';
import { overrideConsoleLog } from 'setup-debug-tools.ts';

overrideConsoleLog();

initCanvas();

const appComponent = Injector.resolve(AppComponent);
document.querySelector('#app')!.appendChild(appComponent.getElement());

document.addEventListener('contextmenu', event => event.preventDefault());

console.log('App initialized successfully.');