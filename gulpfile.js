import {series} from 'gulp';
import dashboard from './gulptasks/dashboard.js';
import backend from './gulptasks/backend.js';

export default series(dashboard, backend);

export {dashboard, backend}
