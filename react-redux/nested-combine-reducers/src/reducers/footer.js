/**
 * @since 2017-05-13 10:26:50
 * @author vivaxy
 */

import { combineReducers } from 'redux';

import input from './footer/input';
import error from './footer/error';

export default combineReducers({
    input,
    error,
});
