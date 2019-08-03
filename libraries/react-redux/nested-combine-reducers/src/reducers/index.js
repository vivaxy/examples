/**
 * @since 2017-05-13 10:26:27
 * @author vivaxy
 */

import { combineReducers } from 'redux';

import header from './header';
import footer from './footer';

export default combineReducers({
  header,
  footer,
});
