import { combineReducers } from 'redux';
import loginReducer from './loginReducer';
import joinReducer from './joinReducer';
import { friendReducer } from './friendListReducer';
import { requestFriendReducer } from './requestFriendReducer';
import roomsReducer from './roomsReducer';
import chatReducer from './chatReducer';
import adminLoginReducer from './adminLoginReducer';
import adminJoinReducer from './adminJoinReducer';

export const reducer = combineReducers({
    join: joinReducer,
    login: loginReducer,
    friend: friendReducer,
    requestFriend: requestFriendReducer,
    chat: chatReducer,
    room: roomsReducer,
    adminjoin: adminJoinReducer,
    adminlogin: adminLoginReducer

});