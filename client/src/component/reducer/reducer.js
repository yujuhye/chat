import { combineReducers } from 'redux';
import loginReducer from './loginReducer';
import joinReducer from './joinReducer';

export const reducer = combineReducers({
    join: joinReducer,
    login: loginReducer


});


