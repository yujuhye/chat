import React, { useEffect } from 'react';

import useAxiosGetAdmin from "../../../util/useAxiosGetAdmin";
import Nav from '../../../include/Nav';

const AdminDashboard = () => {

    useAxiosGetAdmin();

    return (

        <div>
            <Nav />
        </div>

    );
};

export default AdminDashboard;