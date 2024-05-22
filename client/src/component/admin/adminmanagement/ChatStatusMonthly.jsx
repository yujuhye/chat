import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import useAxiosGetAdmin from '../../../util/useAxiosGetAdmin';
import { Link } from 'react-router-dom';
import '../../../css/admin/adminmanagement/chatstatusmonthly.css';

const ChatStatusMonthly = ({ onSelectMonth, currentPage, setCurrentPage }) => {
    const [data, setData] = useState([]);
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');
    const itemsPerPage = 6;

    useAxiosGetAdmin();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await axios.get('http://localhost:3001/admin/chatStatusMonthly');

            const now = new Date();
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth() + 1;

            const formattedData = response.data
                .filter(item => item.chatYear < currentYear || (item.chatYear === currentYear && item.chatMonth <= currentMonth))
                .map(item => ({
                    ...item,
                    chatDate: `${item.chatYear}.${String(item.chatMonth).padStart(2, '0')}`
                }));

            const months = Array.from({ length: 12 }, (_, i) => i + 1);
            const years = [...new Set(formattedData.map(item => item.chatYear))];

            const completeData = [];
            years.forEach(year => {
                months.forEach(month => {
                    if (year === currentYear && month > currentMonth) return;
                    const existingData = formattedData.find(item => item.chatYear === year && item.chatMonth === month);
                    completeData.push({
                        chatYear: year,
                        chatMonth: month,
                        chatDate: `${year}.${String(month).padStart(2, '0')}`,
                        chatCount: existingData ? existingData.chatCount : 0
                    });
                });
            });

            const reversedData = completeData.reverse();
            setData(reversedData);
        } catch (error) {
            console.error('Error fetching monthly data:', error);
            setData([]);
        }
    };

    const handleBarClick = (data) => {
        if (data && data.activeLabel) {
            const [year, month] = data.activeLabel.split('.');
            onSelectMonth(`${year}.${month}`);
        }
    };

    const handlePrevPage = () => {
        if ((currentPage * itemsPerPage) < data.length) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPageData = data.slice(startIndex, endIndex).reverse();

    const years = Array.from({ length: 11 }, (_, i) => (2023 + i).toString());
    const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString());

    const handleSelectDate = () => {
        if (selectedYear === '' || selectedMonth === '') {
            alert('검색하고 싶은 연도와 월을 선택하세요.');
            return;
        }

        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;

        if (parseInt(selectedYear) > currentYear || (parseInt(selectedYear) === currentYear && parseInt(selectedMonth) > currentMonth)) {
            alert('해당 월의 데이터가 없습니다.');
            return;
        }

        const index = data.findIndex(item => item.chatYear.toString() === selectedYear && item.chatMonth.toString() === selectedMonth);
        if (index !== -1) {
            const pageIndex = Math.floor(index / itemsPerPage) + 1;
            setCurrentPage(pageIndex);
        } else {
            alert('해당 월의 데이터가 없습니다.');
        }
    };

    return (
        <div className="chatStatusContainer">
            <h1 className="chatStatusHeader">월별 채팅 수 통계</h1>
            <div className="topBar">
                <Link to="/admin/chatstatushourly" className="hourlyLink">시간대별 통계 이동</Link>
                <div className="dateSelector">
                    <label>
                        연도:
                        <select value={selectedYear} onChange={(e) => {
                            setSelectedYear(e.target.value);
                            setSelectedMonth('');
                        }}>
                            <option value="">선택</option>
                            {years.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </label>
                    <label>
                        월:
                        <select value={selectedMonth} onChange={(e) => {
                            setSelectedMonth(e.target.value);
                        }}>
                            <option value="">선택</option>
                            {months.map(month => (
                                <option key={month} value={month}>{month}</option>
                            ))}
                        </select>
                    </label>
                    <button onClick={handleSelectDate} className="searchButton">검색</button>
                </div>
            </div>
            <ResponsiveContainer width="80%" height={400}>
                <BarChart
                    data={currentPageData}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                    onClick={handleBarClick}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="chatDate" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="chatCount" fill="#0B76A0" barSize={120} />
                </BarChart>
            </ResponsiveContainer>
            <div className="paginationButtons">
                <button onClick={handlePrevPage} disabled={currentPage * itemsPerPage >= data.length} className="pageButton">이전</button>
                <button onClick={handleNextPage} disabled={currentPage === 1} className="pageButton">다음</button>
            </div>
        </div>
    );
}

export default ChatStatusMonthly;