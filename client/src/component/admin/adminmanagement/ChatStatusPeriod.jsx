import React, { useState } from 'react';
import ChatStatusMonthly from './ChatStatusMonthly';
import ChatStatusWeekly from './ChatStatusWeekly';
import ChatStatusDaily from './ChatStatusDaily';
import Nav from '../../../include/Nav';

const ChatStatusPeriod = () => {
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [selectedWeek, setSelectedWeek] = useState(null);
    const [monthlyPage, setMonthlyPage] = useState(1);

    const handleSelectMonth = (month) => {
        console.log('Selected month:', month);
        setSelectedMonth(month);
        setSelectedWeek(null);
    };

    const handleSelectWeek = (week) => {
        console.log('Selected week:', week);
        setSelectedWeek(week);
    };

    const handleBackToMonthly = () => {
        setSelectedMonth(null);
        setSelectedWeek(null);
    };

    const handleBackToWeekly = () => {
        setSelectedWeek(null);
    };

    return (
        <div>
            <Nav />
            {!selectedMonth && (
                <ChatStatusMonthly
                    onSelectMonth={handleSelectMonth}
                    currentPage={monthlyPage}
                    setCurrentPage={setMonthlyPage}
                />
            )}
            {selectedMonth && !selectedWeek && (
                <ChatStatusWeekly
                    selectedMonth={selectedMonth}
                    onSelectWeek={handleSelectWeek}
                    onBackToMonthly={handleBackToMonthly}
                />
            )}
            {selectedWeek && (
                <ChatStatusDaily
                    selectedWeek={selectedWeek}
                    onBackToWeekly={handleBackToWeekly}
                />
            )}
        </div>
    );
};

export default ChatStatusPeriod;
