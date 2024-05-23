import React, { useEffect, useState, useRef } from 'react';
import socket from './socket';
import uploadFile from '../../util/uploadFileOpenChat';

const OpenChatRoom = ({ room, onLeave }) => {

    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [attachedFiles, setAttachedFiles] = useState([]);
    const messagesEndRef = useRef(null);



    useEffect(() => {
        console.log('curentroom', room);

        socket.emit('getPreviousMessagesForOpenChat', { roomId: room.OPEN_R_NO, limit: 20 });

        // 새로운 메시지 수신
        socket.on('newMessageForOpenChat', (message) => {
            setMessages((prevMessages) => [...prevMessages, message]);
        });

        // 이전 메시지 수신
        socket.on('previousMessagesForOpenChat', (previousMessages) => {
            setMessages((prevMessages) => [...previousMessages, ...prevMessages]);
        });
        return () => {
            // 컴포넌트 언마운트 시 이벤트 리스너 제거
            socket.off('newMessageForOpenChat');
            socket.off('previousMessagesForOpenChat');
        };
    }, [room]);



    useEffect(() => {
        // 메시지 목록 스크롤 이벤트 처리
        const messageList = messagesEndRef.current;
        const handleScroll = () => {
            if (messageList.scrollTop === 0) {
                socket.emit('loadMoreMessagesForOpenChat', {
                    roomId: room.OPEN_R_NO,
                    lastMessageId: messages[0]?.OPEN_C_NO,
                    limit: 20,
                });
            }
        };

        messageList.addEventListener('scroll', handleScroll);

        return () => {
            messageList.removeEventListener('scroll', handleScroll);
        };
    }, [messages, room]);



    const handleSendMessage = async () => {
        if (inputText.trim() !== '' || attachedFiles.length > 0) {
            if (attachedFiles.length > 0) {
                for (const file of attachedFiles) {
                    const uploadedFile = await uploadFile(file);
                    const message = {
                        roomId: room.OPEN_R_NO,
                        file: uploadedFile.secure_url,
                    };
                    socket.emit('sendMessageForOpenChat', message);
                }
            }

            if (inputText.trim() !== '') {
                const message = {
                    roomId: room.OPEN_R_NO,
                    text: inputText,
                };
                socket.emit('sendMessageForOpenChat', message);
            }

            setInputText('');
            setAttachedFiles([]);
        }
    };

    const handleInputChange = (event) => {
        setInputText(event.target.value);
    };

    const handleFileChange = (event) => {
        setAttachedFiles(Array.from(event.target.files));
    };

    const handleDragOver = (event) => {
        event.preventDefault();
    };

    const handleDrop = (event) => {
        event.preventDefault();
        setAttachedFiles(Array.from(event.dataTransfer.files));
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleSendMessage();
        }
    };

    const handleLeaveChatRoom = () => {
        onLeave();
    };

    return (
        <div>
            <h3>{room.OPEN_R_NO}</h3>
            <button onClick={handleLeaveChatRoom}>Leave</button>

            <div className="message-list" ref={messagesEndRef}>
                {messages.map((message) => (
                    <div key={message.OPEN_C_NO}>
                        <p>{message.OPEN_P_NICKNAME}: {message.OPEN_C_TEXT}</p>
                        {message.OPEN_C_IMAGE && (
                            <img src={message.OPEN_C_IMAGE} alt="Attached" />
                        )}
                    </div>
                ))}
            </div>

            <div
                className="message-input"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                <input
                    type="text"
                    value={inputText}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyPress}
                />
                <input type="file" multiple onChange={handleFileChange} />
                <button onClick={handleSendMessage}>전송</button>
            </div>
        </div>
    );
};

export default OpenChatRoom;