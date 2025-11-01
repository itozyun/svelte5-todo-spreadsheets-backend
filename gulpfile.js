import {series} from 'gulp';
import dashboard from './gulptasks/dashboard.js';
import backend from './gulptasks/backend.js';
import deploy from './gulptasks/deploy.js';

export default series(dashboard, backend, deploy);

export {dashboard, backend, deploy}
