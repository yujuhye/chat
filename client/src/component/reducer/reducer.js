import { combineReducers } from 'redux';
import loginReducer from './loginReducer';
import joinReducer from './joinReducer';
import { friendReducer } from './friendListReducer';
import { requestFriendReducer } from './requestFriendReducer';
import roomsReducer from './roomsReducer';
import chatReducer from './chatReducer';
import adminLoginReducer from './adminLoginReducer';
import adminJoinReducer from './adminJoinReducer';
import newsReducer from './newsReducer';
import memberModifyReducer from './memberModifyReducer';
import findPasswordReducer from './findPasswordReducer';
import fileReducer from './fileReducer';
import openChatReducer from './openChatReducer';

export const reducer = combineReducers({
    join: joinReducer,
    login: loginReducer,
    findpassword: findPasswordReducer,
    membermodify: memberModifyReducer,
    friend: friendReducer,
    requestFriend: requestFriendReducer,
    chat: chatReducer,
    room: roomsReducer,
    adminjoin: adminJoinReducer,
    adminlogin: adminLoginReducer,
    file: fileReducer,
    news: newsReducer,
    openChat: openChatReducer


});