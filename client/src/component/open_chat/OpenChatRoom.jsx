import React from 'react';
import socket from './socket';

const OpenChatRoom = ({ room, onLeave }) => {
    const handleSendMessage = (message) => {
        socket.emit('message', { roomId: room.id, message });
    };

    const handleLeaveChatRoom = () => {
        onLeave();
    };

    return (
        <div>
            <h3>{room.OPEN_R_NO}</h3>
            {/* 채팅 메시지 표시 및 입력 폼 */}
            <button onClick={handleLeaveChatRoom}>Leave</button>
        </div>
    );
};

export default OpenChatRoom;