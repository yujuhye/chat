import React, { useState, useEffect } from 'react';
import Nav from '../../../include/Nav';
import useAxiosGetAdmin from '../../../util/useAxiosGetAdmin';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const ChatStatusHourly = () => {
    const [data, setData] = useState([]);

    useAxiosGetAdmin();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await axios.get(`http://localhost:3001/admin/ChatStatusThreeHourly`);
            // Process the data
            const hourlyCounts = new Array(8).fill(0);
            response.data.forEach(item => {
                const hour = parseInt(item.chatHour);
                const index = Math.floor(hour / 3);
                hourlyCounts[index] += item.chatCount;
            });

            // Format data for Recharts
            const formattedData = hourlyCounts.map((count, index) => {
                const startTime = index * 3;
                const endTime = (index + 1) * 3 - 1;
                return {
                    timeRange: `${startTime}:00-${endTime}:59`,
                    chatCount: count
                };
            });

            setData(formattedData);
        } catch (error) {
            console.error('Error fetching data:', error);
            setData([]);
        }
    };

    return (
        <div>
            <Nav />
            <h1>시간대별 채팅 수 통계</h1>

            <Link to="/admin/chatstatusperiod">기간별 통계</Link><br />


            <ResponsiveContainer width="80%" height={400}>
                <BarChart
                    data={data}
                    margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timeRange" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="chatCount" fill="#82ca9d" barSize={100} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ChatStatusHourly;