import React, { useEffect } from 'react';

import useAxiosGetAdmin from "../../../util/useAxiosGetAdmin";
import Nav from '../../../include/Nav';
import { Link } from 'react-router-dom';
import '../../../css/admin/adminmanagement/admindashboard.css';

const AdminDashboard = () => {

    useAxiosGetAdmin();

    return (
        <div>
            <div className="dashboardContainer">
                <Link to="/admin/news" className="dashboardLink">공지사항</Link>
                <Link to="/admin/userstatus" className="dashboardLink">유저 통계</Link>
                <Link to="/admin/chatstatushourly" className="dashboardLink">채팅 통계</Link>
                <div className="dashboardLink">배너 광고 관리<br />(추후 개발)</div>
            </div>
        </div>
    );
};

export default AdminDashboard;