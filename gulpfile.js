import {series} from 'gulp';
import dashboard from './gulptasks/dashboard.js';
import backend from './gulptasks/backend.js';
import clasp from './gulptasks/clasp.js';

export default series(dashboard, backend, clasp);

export {dashboard, backend, clasp}
