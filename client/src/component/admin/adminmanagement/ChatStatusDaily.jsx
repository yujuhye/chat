import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { useNavigate } from 'react-router-dom';

const ChatStatusDaily = ({ selectedWeek, onBackToWeekly }) => {
    const [data, setData] = useState([]);
    const [title, setTitle] = useState('');

    useEffect(() => {
        if (selectedWeek && typeof selectedWeek === 'number') {
            const year = Math.floor(selectedWeek / 100);
            const weekNumber = selectedWeek % 100;

            // Calculate the start date of the week
            const firstDayOfYear = new Date(year, 0, 1);
            const daysOffset = (weekNumber - 1) * 7;
            const startDate = new Date(firstDayOfYear.setDate(firstDayOfYear.getDate() + daysOffset));

            // Find the exact date of the start of the week
            const startOfWeek = new Date(startDate.setDate(startDate.getDate() - startDate.getDay() + 1));

            // Get the month and the week in the month
            const month = startOfWeek.getMonth() + 1;
            const weekInMonth = Math.ceil((startOfWeek.getDate() + 6) / 7);

            // Format the title
            setTitle(`${year}.${String(month).padStart(2, '0')} ${weekInMonth}주의 요일별 채팅 수 통계`);

            fetchData(selectedWeek);
        }
    }, [selectedWeek]);

    const fetchData = async (week) => {
        if (week) {
            try {
                const response = await axios.get(`http://localhost:3001/admin/chatStatusDaily/${week}`);
                const formattedData = formatDailyData(response.data);
                setData(formattedData);
            } catch (error) {
                console.error('Error fetching daily data:', error);
                setData([]);
            }
        }
    };

    const formatDailyData = (data) => {
        const daysInWeek = Array.from({ length: 7 }, (_, i) => i + 1); // 1 to 7 (Sun to Sat)
        return daysInWeek.map(day => {
            const existingData = data.find(item => item.chatDay === day);
            return {
                chatDayLabel: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day - 1],
                chatCount: existingData ? existingData.chatCount : 0
            };
        });
    };

    return (
        <div>
            <h1>{title}</h1>
            <button onClick={onBackToWeekly}>주별 통계로 돌아가기</button>
            <ResponsiveContainer width="80%" height={400}>
                <BarChart
                    data={data}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="chatDayLabel" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="chatCount" fill="#7CCA62" barSize={120} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ChatStatusDaily;