import { combineReducers } from 'redux';

import input from './footer/input';
import error from './footer/error';

export default combineReducers({
  input,
  error,
});
