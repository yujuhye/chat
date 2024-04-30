import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './member/Login';
import List from './member/List';
import Join from './member/Join';

const MainHome = () => {

    return (
        <BrowserRouter>

            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/list" element={<List />} />
                <Route path="/join" element={<Join />} />
            </Routes>

        </BrowserRouter>
    );
};

export default MainHome;