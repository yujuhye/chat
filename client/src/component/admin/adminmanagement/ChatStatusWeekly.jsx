import React, { useState, useEffect } from 'react';
import Nav from '../../../include/Nav';
import useAxiosGetAdmin from "../../../util/useAxiosGetAdmin";

const ChatStatusWeekly = () => {

    useAxiosGetAdmin();

    return (
        <div>
            <Nav />
        </div>

    );
};

export default ChatStatusWeekly;