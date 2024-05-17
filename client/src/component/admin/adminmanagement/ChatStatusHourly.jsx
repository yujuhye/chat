import React, { useState, useEffect } from 'react';
import Nav from '../../../include/Nav';
import useAxiosGetAdmin from "../../../util/useAxiosGetAdmin";
import axios from 'axios';
import { Link } from 'react-router-dom';

const ChatStatusHourly = () => {

    const [data, setData] = useState([]);

    useAxiosGetAdmin();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await axios.get(`http://localhost:3001/admin/ChatStatusThreeHourly`);
            setData(response.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            setData([]);
        }
    };

    const drawBarChart = () => {
        const canvas = document.getElementById('hourlyBarChart');
        const ctx = canvas.getContext('2d');

        const barHeight = 40;
        const barPadding = 15;
        const startX = 50;
        const startY = 50;
        const barMaxLength = 800;

        if (data.length === 0) {
            return;
        }

        // 전체 기간 내 시간대별 채팅 수 계산
        const hourlyCounts = new Array(8).fill(0);

        data.forEach(item => {
            const hour = parseInt(item.chatHour);
            const index = Math.floor(hour / 3);
            hourlyCounts[index] += item.chatCount;
        });

        const maxValue = Math.max(...hourlyCounts);

        const canvasHeight = 50 + (hourlyCounts.length * (barHeight + barPadding));
        canvas.height = canvasHeight;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        hourlyCounts.forEach((count, index) => {
            const barWidth = (count / maxValue) * barMaxLength;
            const x = startX;
            const y = startY + index * (barHeight + barPadding);

            ctx.fillStyle = 'blue';
            ctx.fillRect(x, y, barWidth, barHeight);

            ctx.fillStyle = 'black';
            ctx.fillText(count, x + barWidth + 5, y + barHeight / 2 + 5);

            // 시작 시간과 종료 시간 계산
            const startTime = index * 3;
            const endTime = (index + 1) * 3 - 1;

            ctx.fillStyle = 'white';
            const timeText = `${startTime}:00-${endTime}:59`;
            ctx.fillText(timeText, startX + 5, y + barHeight / 2 + 5);
        });
    };



    useEffect(() => {
        drawBarChart();
    }, [data]);

    return (
        <div>
            <Nav />
            <h1>시간대별 채팅 수 통계</h1>
            <Link to="/admin/chatstatusdaily">일별 통계</Link><br />
            <Link to="/admin/chatstatusweekly">주별 통계</Link><br />

            <canvas id="hourlyBarChart" width="1000" ></canvas>
        </div>
    );
};

export default ChatStatusHourly;