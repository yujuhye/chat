import React, { useState, useEffect } from 'react';
import Nav from '../../../include/Nav';
import useAxiosGetAdmin from "../../../util/useAxiosGetAdmin";
import { Link } from 'react-router-dom';
import axios from 'axios';

const ChatStatusDaily = () => {

    // const [data, setData] = useState([]);
    // const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);

    // useAxiosGetAdmin();

    // useEffect(() => {
    //     fetchData(currentMonth);
    // }, [currentMonth]);

    // const fetchData = async (month) => {
    //     try {
    //         const response = await axios.get(`http://localhost:3001/admin/chatStatusDaily?month=${month}`);
    //         setData(response.data);
    //     } catch (error) {
    //         console.error('Error fetching data:', error);
    //         setData([]);
    //     }
    // };

    // const drawBarChart = () => {
    //     const canvas = document.getElementById('monthlyBarChart');
    //     const ctx = canvas.getContext('2d');

    //     const barWidth = 40;
    //     const barPadding = 20;
    //     const startX = 50;
    //     const startY = 50;
    //     const barMaxLength = 300;

    //     if (data.length === 0) {
    //         return;
    //     }

    //     ctx.clearRect(0, 0, canvas.width, canvas.height);

    //     const months = ['월', '화', '수', '목', '금', '토', '일'];

    //     data.forEach((item, index) => {
    //         const x = startX + index * (barWidth + barPadding);
    //         const y = startY;
    //         const barHeight = (item.chatCount / maxChatCount) * barMaxLength;

    //         ctx.fillStyle = 'blue';
    //         ctx.fillRect(x, y, barWidth, barHeight);

    //         ctx.fillStyle = 'black';
    //         ctx.fillText(item.chatCount, x + barWidth / 2 - 10, y + barHeight + 20);

    //         ctx.fillStyle = 'black';
    //         ctx.fillText(months[index], x + barWidth / 2 - 10, y + barHeight + 40);
    //     });
    // };

    // useEffect(() => {
    //     drawBarChart();
    // }, [data]);

    // const handlePreviousMonth = () => {
    //     setCurrentMonth(prevMonth => prevMonth === 1 ? 12 : prevMonth - 1);
    // };

    // const handleNextMonth = () => {
    //     setCurrentMonth(prevMonth => prevMonth === 12 ? 1 : prevMonth + 1);
    // };

    return (
        <div>
            <Nav />
            <h1>월별 채팅 수 통계</h1>
            <Link to="/admin/chatstatusdaily">일별 통계</Link><br />
            <Link to="/admin/chatstatusweekly">주별 통계</Link><br />
            {/* 
            <button onClick={handlePreviousMonth}>이전</button>
            <button onClick={handleNextMonth}>다음</button> */}

            <canvas id="monthlyBarChart" width="1000"></canvas>
        </div>
    );
};

export default ChatStatusDaily;