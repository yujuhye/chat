import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import Nav from '../../../include/Nav';
import useAxiosGetAdmin from '../../../util/useAxiosGetAdmin';
import '../../../css/admin/adminmanagement/userstatus.css';

const UserStatus = () => {
    const [data, setData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [maxRegistrationCount, setMaxRegistrationCount] = useState(0);
    const itemsPerPage = 12;

    useAxiosGetAdmin();

    useEffect(() => {
        fetchData();
    }, [currentPage]);

    const fetchData = async () => {
        try {
            const response = await axios.get(`http://localhost:3001/admin/userStatus`);
            const formattedData = response.data.reverse().map(item => ({
                ...item,
                regDate: `${item.regYear}.${String(item.regMonth).padStart(2, '0')}`
            }));
            setData(formattedData);

            // Calculate the maximum registration count
            const maxCount = Math.max(...formattedData.map(item => item.registrationCount));
            setMaxRegistrationCount(maxCount);
        } catch (error) {
            console.error('Error fetching data:', error);
            setData([]);
        }
    };

    const handleNextPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage < Math.ceil(data.length / itemsPerPage)) {
            setCurrentPage(currentPage + 1);
        }
    };

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    let currentPageData = data.slice(startIndex, endIndex).reverse();

    if (currentPageData.length < itemsPerPage) {
        const placeholders = Array(itemsPerPage - currentPageData.length).fill({ regDate: '', registrationCount: 0 });
        currentPageData = [...placeholders, ...currentPageData];
    }

    return (
        <div>
            <Nav />
            <div className="userStatusContainer">
                <h1 className="userStatusHeader">월별 가입자 수 현황</h1>

                <ResponsiveContainer width="80%" height={400}>
                    <BarChart
                        data={currentPageData}
                        margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="regDate" />
                        <YAxis domain={[0, maxRegistrationCount]} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="registrationCount" fill="#8884d8" />
                    </BarChart>
                </ResponsiveContainer>
                <div className="paginationButtons">
                    <button onClick={handlePrevPage} disabled={currentPage * itemsPerPage >= data.length} className="pageButton">이전</button>
                    <button onClick={handleNextPage} disabled={currentPage === 1} className="pageButton">다음</button>
                </div>
            </div>
        </div>
    );
};

export default UserStatus;