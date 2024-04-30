import { combineReducers } from 'redux';
import loginReducer from './loginReducer';
import joinReducer from './joinReducer';
import { friendReducer } from './friendListReducer';

export const reducer = combineReducers({
    join: joinReducer,
    login: loginReducer,
    friend: friendReducer


});