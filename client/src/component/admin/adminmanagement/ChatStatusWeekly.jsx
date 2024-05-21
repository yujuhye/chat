import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { useNavigate } from 'react-router-dom';

const ChatStatusWeekly = ({ selectedMonth, onSelectWeek, onBackToMonthly }) => {
    const [data, setData] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, [selectedMonth]);

    const fetchData = async () => {
        try {
            console.log('Fetching weekly data for month:', selectedMonth);
            const response = await axios.get(`http://localhost:3001/admin/chatStatusWeekly/${selectedMonth}`);
            console.log('Weekly data response:', response.data);

            const formattedData = formatWeeklyData(response.data);
            setData(formattedData);
        } catch (error) {
            console.error('Error fetching weekly data:', error);
            setData([]);
        }
    };

    const formatWeeklyData = (data) => {
        const [year, month] = selectedMonth.split('.').map(Number);
        const weeksInMonth = getWeeksInMonth(year, month);

        return weeksInMonth.map(week => {
            const existingData = data.find(item => {
                const itemYear = Math.floor(item.chatWeek / 100);
                const itemWeek = item.chatWeek % 100;
                return itemYear === year && itemWeek === week.weekNumber;
            });

            return {
                chatWeek: `${year}${String(week.weekNumber).padStart(2, '0')}`,
                chatWeekLabel: `${week.weekOfMonth}주차`,
                chatCount: existingData ? existingData.chatCount : 0
            };
        });
    };

    const getWeeksInMonth = (year, month) => {
        const weeks = [];
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        let weekNumber = getWeekNumber(startDate);

        while (startDate <= endDate) {
            const weekOfMonth = Math.ceil(startDate.getDate() / 7);
            const weekKey = `${year}${String(weekNumber).padStart(2, '0')}`;
            weeks.push({ weekNumber, weekOfMonth, weekKey });
            startDate.setDate(startDate.getDate() + 7);
            weekNumber++;
        }

        return weeks;
    };

    const getWeekNumber = (date) => {
        const startOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date - startOfYear) / 86400000;
        return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
    };

    const handleBarClick = (data) => {
        if (data && data.activePayload) {
            const selectedWeek = data.activePayload[0].payload.chatWeek;
            onSelectWeek(parseInt(selectedWeek, 10));
        }
    };

    return (
        <div>
            <h1>{selectedMonth}월의 주별 채팅 수 통계</h1>
            <button onClick={onBackToMonthly}>월별 통계로 돌아가기</button>
            <ResponsiveContainer width="80%" height={400}>
                <BarChart
                    data={data}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                    onClick={handleBarClick}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="chatWeekLabel" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="chatCount" fill="#D19BD0" barSize={120} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ChatStatusWeekly;