import React, { useState, useEffect } from 'react';
import Nav from '../../../include/Nav';
import useAxiosGetAdmin from '../../../util/useAxiosGetAdmin';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import '../../../css/admin/adminmanagement/chatstatushourly.css';

const ChatStatusHourly = () => {
    const [data, setData] = useState([]);

    useAxiosGetAdmin();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await axios.get(`http://localhost:3001/admin/ChatStatusThreeHourly`);

            const hourlyCounts = new Array(8).fill(0);
            response.data.forEach(item => {
                const hour = parseInt(item.chatHour);
                const index = Math.floor(hour / 3);
                hourlyCounts[index] += item.chatCount;
            });

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
            <div className="chatStatusHourlyContainer">

                <h1 className="hourlyHeader">시간대별 채팅 수 통계</h1>
                <Link to="/admin/chatstatusperiod" className="periodLink">기간별 통계 이동</Link>
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
        </div>
    );
};

export default ChatStatusHourly;