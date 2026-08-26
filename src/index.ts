import './localization';
import options from './options';
import { Roulette } from './roulette';

const roulette = new Roulette();

const isLocalhost = ['localhost', '127.0.0.1'].includes(location.hostname);
const testSpeed = Number(new URLSearchParams(location.search).get('testSpeed'));
if (isLocalhost && Number.isFinite(testSpeed) && testSpeed > 0 && testSpeed <= 4) roulette.setSpeed(testSpeed);

(window as any).roulette = roulette;
(window as any).options = options;
