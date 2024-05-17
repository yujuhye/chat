import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Nav from '../../../include/Nav';
import useAxiosGetAdmin from '../../../util/useAxiosGetAdmin';

const UserStatus = () => {
    const [data, setData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    useAxiosGetAdmin();

    useEffect(() => {
        fetchData();
    }, [currentPage]);

    const fetchData = async () => {
        try {
            const totalMonths = 240;
            const startMonth = totalMonths - (currentPage - 1) * itemsPerPage - 11;
            const endMonth = totalMonths - (currentPage - 1) * itemsPerPage;
            const response = await axios.get(`http://localhost:3001/admin/userStatus?startMonth=${startMonth}&endMonth=${endMonth}`);
            setData(response.data.reverse());
        } catch (error) {
            console.error('Error fetching data:', error);
            setData([]);
        }
    };

    const drawBarChart = () => {
        const canvas = document.getElementById('barChart');
        const ctx = canvas.getContext('2d');

        const barWidth = 40;
        const barPadding = 10;
        const startX = 50;
        const startY = 250;

        if (data.length === 0) {
            return;
        }

        const maxValue = Math.max(...data.map(item => item.registrationCount));

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const startIdx = (currentPage - 1) * itemsPerPage;
        const endIdx = currentPage * itemsPerPage;
        const currentPageData = data.slice(startIdx, endIdx);

        currentPageData.forEach((item, index) => {
            const barHeight = (item.registrationCount / maxValue) * 200;
            const x = startX + (itemsPerPage - index - 1) * (barWidth + barPadding);
            const y = startY - barHeight;

            ctx.fillStyle = 'blue';
            ctx.fillRect(x, y, barWidth, barHeight);

            ctx.fillStyle = 'black';
            ctx.fillText(item.registrationCount, x + barWidth / 2 - ctx.measureText(item.registrationCount).width / 2, y - 5);

            ctx.fillStyle = 'black';
            ctx.fillText(`${item.regYear}.${item.regMonth}`, x + barWidth / 2 - ctx.measureText(`${item.regYear}.${item.regMonth}`).width / 2, startY + 15);
        });
    };

    useEffect(() => {
        drawBarChart();
    }, [data]);

    const handleNextPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handlePrevPage = () => {
        const totalPages = Math.ceil(data.length / itemsPerPage);
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    return (
        <div>
            <Nav />
            <h1>월별 가입자 수 현황</h1>
            <button onClick={handlePrevPage}>이전</button>
            <button onClick={handleNextPage}>다음</button>
            <canvas id="barChart" width="800" height="400"></canvas>
        </div>
    );
};

export default UserStatus;