import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './member/Login';
import List from './member/List';
import Join from './member/Join';
import FriendList from './friend/FriendList';
import ChatRoom from './chat/ChatRoom';
import Chat from './chat/Chat';

const MainHome = () => {

    return (
        <BrowserRouter>
            <Nav />
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/list" element={<List />} />
                <Route path="/join" element={<Join />} />
                <Route path='/friend/friendList' element={<FriendList />}></Route>
                <Route path='/chatRoom/list' element={<ChatRoom />}></Route>
                <Route path='/chat/chatView/:roomId' element={<Chat />}></Route>
            </Routes>

        </BrowserRouter>
    );
};

export default MainHome;