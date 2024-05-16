import React, { useEffect } from 'react';
import { setIsAdminLoginAction, setAdminIdAction } from '../../component/action/adminLoginActions';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import Nav from '../../include/Nav';

const AdminHome = () => {

    const isAdminLogin = useSelector(state => state.adminlogin.isAdminLogin);

    return (
        <div>
            <Nav />
            {isAdminLogin ? <Navigate to="/admin/dashboard" /> : <Navigate to="/admin/adminlogin" />}

        </div>

    );
};

export default AdminHome;