import React, { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

const Chat = () => {
    const { roomId }                            = useParams();     // URL 파라미터에서 roomId 추출
    const [joinUserInfo,    setJoinUserInfo]    = useState('');    // 채팅 참여자 정보
    const [inputMessage,    setInputMessage]    = useState('');    // 입력 필드 상태
    const [messages,        setMessages]        = useState([]);    // 실시간 메시지 및 과거 채팅 기록

    const [isShowFileModal, setIsShowFileModal] = useState(false); // 파일 모달

    useEffect(() => {
        // 채팅방 정보 불러오기
        roomDetails(roomId);
        socket.emit('joinRoom', roomId);

        // 실시간 메시지 받기
        socket.on('message', message => {
            setMessages(prevMessages => [...prevMessages, message]);
        });

        // 컴포넌트 언마운트 시 소켓 연결 해제
        return () => {
            socket.disconnect();
        };
    }, [roomId]);

    const sendMessage = () => {
        if (!inputMessage.trim()) return; // 메시지가 비어있으면 반환
        // 소켓을 사용하여 서버로 메시지를 전송하는 로직
        socket.emit('sendMessage', { sender: "You", content: inputMessage, roomId });
        setInputMessage(""); // 입력 필드 초기화
    };

    const roomDetails = (roomId) => {
        axios({
            url: `http://localhost:3001/chat/details/${roomId}`,
            method: 'get',
            params: { roomId },
        })
        .then(response => {
            const { participants, chatHistory } = response.data;

            setJoinUserInfo(participants); // 채팅 참여자 정보
            setMessages(chatHistory);      // 과거 채팅 기록을 메시지 상태에 추가

        })
        .catch(err => {
            console.error('채팅 정보를 가져오는데 오류가 발생했습니다. -----> ', err);
        });
    };

    // 파일 전송 모달 열기
    const sendFileBtnClickHandler = () => {
        console.log('sendFileBtnClickHandler()');

        setIsShowFileModal(true);
    }

    // 파일 전송 모달 닫기
    const fileModalCloseBtnClickHandler = () => {
        console.log('fileModalCloseBtnClickHandler()');

        setIsShowFileModal(false);
    }

    return (
        <div>
            <h2>Chat Detail</h2>
            <div>
                {/* 메시지 표시 영역 */}
                <div>
                    {messages.map((msg, index) => (
                        <div key={index} className={msg.isRead ? 'read' : 'unread'}>
                            <p>
                                <strong>{msg.USER_NICKNAME}</strong>
                                <br />
                                {msg.CHAT_TEXT}
                                &nbsp;&nbsp;
                                {new Date(msg.CHAT_REG_DATE).toLocaleString()}
                                &nbsp;&nbsp;
                                {msg.isRead ? '읽음' : '읽지 않음'}
                            </p>
                            <p>
                                <strong>{msg.USER_NICKNAME}</strong> 
                                <br />
                                {msg.CHAT_TEXT}
                                &nbsp;&nbsp;
                                {new Date(msg.CHAT_REG_DATE).toLocaleString()}
                                &nbsp;&nbsp;
                                {msg.isRead ? '읽음' : '읽지 않음'}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
            <div>
                {/* 메시지 입력 영역 */}
                <input type="button" value="FILE" onClick={sendFileBtnClickHandler} />
                <input
                    type="text"
                    placeholder="Type your message..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                />
                <button onClick={sendMessage}>Send</button>
            </div>
            {
                isShowFileModal
                ?
                    <div className="fileModal">
                        <input type="button" value="IMG" />
                        <input type="button" value="VIDEO" />
                        <input type="button" value="FILE" />
                        <br />
                        <input type="button" value="CLOSE" onClick={fileModalCloseBtnClickHandler}/>
                    </div>
                :
                    null
            }
        </div>
        
    );
}

export default Chat;
