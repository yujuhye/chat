import React, { useState, useEffect } from 'react';
import Nav from '../../../include/Nav';
import useAxiosGetAdmin from "../../../util/useAxiosGetAdmin";

const ChatTimeStatus = () => {

    useAxiosGetAdmin();

    return (
        <div>
            <Nav />
        </div>

    );
};

export default ChatTimeStatus;