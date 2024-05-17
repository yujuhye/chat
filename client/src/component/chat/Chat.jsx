import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import io from 'socket.io-client';
import ChatDetailViewFriendModal from "./ChatDetailViewFriendModal";
import FileModal from "./FileModal";
import { fetchUser } from "./fetchFunction";
import '../../css/common.css';
import '../../css/chat/chat.css'

const socket = io('http://localhost:3001');

const Chat = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { loading, fileData, error }                                  = useSelector(state => state.file);
    const [joinUserInfo, setJoinUserInfo]                               = useState([]); // 초기값을 빈 배열로 설정
    const [roomName, setRoomName]                                       = useState('');
    const [inputMessage, setInputMessage]                               = useState('');
    const [messages, setMessages]                                       = useState([]);
    const [isShowFileModal, setIsShowFileModal]                         = useState(false);
    const [isShowChatInviteFriendModal, setIsShowChatInviteFriendModal] = useState(false);
    const [participants, setParticipants]                               = useState([]);
    const [isShowChatJoinUser, setIsShowChatJoinUser]                   = useState(false);
    const [isMenuOpen, setIsMenuOpen]                                   = useState(false); // 아래로 내려오는 메뉴
    const [searchChatKey, setSearChatKey]                               = useState('');
    const [searchResult, setSearchResult]                               = useState('');

    const toggleMenu = () => {
        console.log('toggleMenu()');
        setIsMenuOpen(!isMenuOpen);
    }
    
    const loadOldMessages = (messages) => {
        setMessages(messages);
    };

    const receiveMessage = (data) => {
        const { sender, content, sentAt, status, readStatus, unreadCount } = data;
        console.log('보낸 메시지 상태 확인 -----> ', status);
        const newMessage = {
            USER_NICKNAME: sender,
            CHAT_TEXT: content,
            CHAT_REG_DATE: sentAt,
            CHAT_CONDITION: status,
            READ_STATUS: readStatus,
            UNREAD_COUNT: unreadCount,
        };
        console.log('채팅 로그 확인해보장 -----> ',newMessage);
        console.log('채팅 로그 확인해보장 READ_STATUS -----> ',newMessage.READ_STATUS);
        console.log('채팅 로그 확인해보장 UNREAD_COUNT -----> ',newMessage.UNREAD_COUNT);
        setMessages((prevMessages) => [...prevMessages, newMessage]); //newMessage를 추가
    };

    // 파일
    useEffect(() => {
        // 방에 참가
        socket.emit('joinRoom', roomId);

        // 파일 정보 수신
        const handleReceiveFile = (data) => {
            console.log('파일 정보 수신:', data);

            const newMessage = {
                ...data.messages, // 기존 마지막 메시지 정보
            };
            
            setMessages(prevMessages => [...prevMessages, newMessage]);
        };

        socket.on('receiveFile', handleReceiveFile);

        // 정리: 컴포넌트 언마운트 시 소켓 연결 해제
        return () => {
            socket.off('receiveFile', handleReceiveFile);
        };
    }, [roomId, socket]);

    useEffect(() => {
        const handleMessageReceive = (messages) => {
            console.log(' ***** 채팅 로그 확인해보장 -----> ',messages);
            receiveMessage(messages);
        };
        socket.on('receiveMessage', handleMessageReceive); 
        return () => {
            socket.off('receiveMessage', handleMessageReceive);
        };
    }, [socket]);

    useEffect(() => {
        console.log('현재 방에 참여한 유저 목록:', participants);
    
        // 읽음 상태 업데이트 요청하기
        //socket.emit('updateReadCnt', roomId, participants);
    
    }, [participants]);

    useEffect(() => {
        roomDetails(roomId);
        
        socket.on('loadOldMessages', loadOldMessages);
        socket.emit('joinRoom', roomId);
        return () => {
            socket.off('loadOldMessages', loadOldMessages);
        };
    }, [roomId, socket]);

    useEffect(() => {
        
        if (fileData) {
            console.log('File uploaded successfully', fileData);
            roomDetails(roomId);
        }

    }, [fileData, error]); 

    useEffect(() => {
        console.log('채팅 로그 업데이트됨 -----> ', messages);
    }, [messages]); // messages 배열이 변경될 때마다 실행

    const inputMessageOnchangeEventHandler = (e) => {
        if (e.target.name === 'chat_text') {
            setInputMessage(e.target.value);
        }
    };

    const sendMessage = () => {
        if (!inputMessage.trim()) return;
        console.log('현재 방에 있는 사람 정보 -----> ', joinUserInfo);
        socket.emit('sendMessage', { sender: joinUserInfo[0]?.USER_NICKNAME, userNo:joinUserInfo[0]?.USER_NO,  content: inputMessage, roomId, }, (error) => {
            if (error) {
                alert(error);
            }
        });        
        setInputMessage("");
    };

    const roomDetails = (roomId) => {
        console.log('roomDetails()');
        return axios({
            url: `http://localhost:3001/chat/details/${roomId}`,
            method: 'get',
            params: { roomId },
        })
        .then((response) => {
            const { participants, chatHistory } = response.data;

            console.log('★★★★★participants ----->', participants);
            console.log('★★★★★chatHistory ----->', chatHistory);

            setJoinUserInfo(participants);
            setMessages(chatHistory);

            const roomName = participants[0].PARTI_CUSTOMZING_NAME;
            console.log('채팅방 이름 -----> ', roomName);

            setRoomName(roomName);

        })
        .catch((err) => {
            console.error('채팅 정보를 가져오는데 오류가 발생했습니다.', err);
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

    // 참여자 목록
    const joinChatUserListClickHandler = () => {
        console.log('joinChatUserListClickHandler()');
        console.log('joinChatUserListClickHandler----->', joinUserInfo);
        setIsShowChatJoinUser(true);
        getJoinUser(joinUserInfo);
    }

    const getJoinUser = (joinUserInfo) => {
        console.log('getJoinUser()');
        console.log('joinUserInfo -----> ', joinUserInfo);
        axios({
           url: `http://localhost:3001/chat/getJoinUser`, 
           method: 'get',
           params: {
                roomId,
           }
        })
        .then(response => {
            if(response.data) {
                console.log('getJoinUser success!');
                console.log('현재 방에 참여한 유저 목록 -----> ', response.data);

                const loggedInUserNo = joinUserInfo[0].USER_NO;
                console.log('현재 로그인한 사람의 USER_NO ----->', loggedInUserNo);       
                
                const sortedParticipants = response.data.sort((a, b) => {
                    if (a.USER_NO === loggedInUserNo) return -1; // 본인이면 배열의 앞쪽으로
                    if (b.USER_NO === loggedInUserNo) return 1;  // 다른 사람이면 본인 뒤로
                    return a.USER_NO - b.USER_NO; // 그 외 경우는 USER_NO의 오름차순으로 정렬
                });       
                setParticipants(sortedParticipants);
            } else {
                console.log('목록 못 불러옴');
            }
        })
        .catch(error => {
            console.log('getJoinUser fail! -----> ', error);
        });
    }
    
    useEffect(() => {
        if (roomId && joinUserInfo) {
          getJoinUser(joinUserInfo);
          console.log('*********** joinUserInfo *********',joinUserInfo);
        }
      }, [roomId, joinUserInfo]);

    const chatJoinUserCloseBtnClickHander = () => {
        console.log('chatJoinUserCloseBtnClickHander()');

        setIsShowChatJoinUser(false);
    }

    // 친구 초대
    const thisChatInviteFriendClickHandler = () => {
        console.log('thisChatInviteFriendClickHandler()');
        setIsShowChatInviteFriendModal(true);
    }

    // 친구 초대 모달 닫기
    const handleFriendInviteModalClose = () => {
        console.log('handleFriendInviteModalClose()');
        setIsShowChatInviteFriendModal(false);
    }

    // 채팅 리스트로 이동
    const locationChatListBtnClickHandler = () => {
        console.log('locationChatListBtnClickHandler()');
        navigate('/chatRoom/list');
    }

    // 방나가기
    const leaveChatRoomBtnClickHandler = async () => {
        try {
            if (window.confirm('정말로 방을 나가시겠습니까?')) {
                const userData = await fetchUser();
                console.log('방에서 나가기도 그지같네 -----> ', userData);
                // setLoginUserInfo(userData);
                let chatInfo = {
                    id: roomId,
                    no: userData.USER_NO,
                }
                socket.emit('leaveRoom', chatInfo);
                console.log('방에서 나가기 이벤트 -----> ', chatInfo);
                navigate('/chatRoom/list'); 
            }
        } catch (error) {
            alert(error.message);
        }
    };

    // 내용검색 시작
    const searchChatTextChangeHander = (e) => {
        console.log('searchChatTextChangeHander()');
        let inputName = e.target.name;
        let inputValue = e.target.value;

        if(inputName === 'chat_text') {
            setSearChatKey(inputValue);
        }
    }

    const searchChatTextBtnClickHander = () => {
        console.log('searchChatTextBtnClickHander()');
        let params = {
            chat_text: searchChatKey,
            roomId: roomId,
        }
        console.log('params -----> ', params);
        axios({
            url: `http://localhost:3001/chat/searChatText`,
            method: 'get',
            params: params,
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then(response => {
            if(response.data) {
                console.log('채팅 내용 검색 성공 -----> ', response.data);
                setSearchResult(response.data); // 검색 결과 저장
                if(response.data.length === 0 ){
                    alert('검색 결과가 없습니다.');
                    searchChatKey('');
                }
            } else {
                console.log('채팅 내용 검색 then fail!!');
                setSearchResult([]);
            }
        })
        .catch(error => {
            console.log('채팅 내용 검색 catch fail -----> ', error);
        });
    }

    const searchCancelBtnClickHander = () => {
        console.log('searchCancelBtnClickHander()');
        setSearchResult([]);
    }
    // 내용 검색 끝

    return (
        <div id="chatWrap">
            <h2 className="roomName">{roomName}</h2>
            {/* 메뉴바 추가 */}
            <div className="chatMenu">
                <input type="text" name="chat_text" onChange={(e)=>searchChatTextChangeHander(e)} />
                <button className="searchChatTextBtn" onClick={searchChatTextBtnClickHander}>SEARCH</button>
                <button className="hamburgerButton" onClick={toggleMenu}>메뉴</button>
                <div className={`menuContent ${isMenuOpen ? 'show' : ''}`}>
                    <button onClick={joinChatUserListClickHandler}>참여자 목록</button>
                    <button onClick={thisChatInviteFriendClickHandler}>친구 초대</button>
                    <button onClick={leaveChatRoomBtnClickHandler}>나가기</button>
                    <button onClick={locationChatListBtnClickHandler}>리스트</button>
                </div>
            </div>
            <div id="messageWrap">
                {/* 메시지 표시 영역 */}
                <div className="messageWrap">
                    {searchResult.length > 0 ? (
                        <>
                            {searchResult.map((msg, index) => (
                                <div key={index} className="msg">
                                    <p>
                                        <strong className="userNickname">{msg.USER_NICKNAME}</strong>
                                        <br />
                                        {msg.CHAT_TEXT}
                                        &nbsp;&nbsp;
                                        {msg.CHAT_REG_DATE}
                                    </p>   
                                </div>
                            ))}
                            <div>
                                <button onClick={searchCancelBtnClickHander}>취소</button>
                            </div>
                        </>
                    ) : (
                        // 검색 결과가 없을 경우 기존 메시지 리스트 표시
                        messages && messages.map((msg, index) => (
                            <div key={index} className="msg">
                                <p>
                                    <strong className="userNickname">{msg.USER_NICKNAME}</strong>
                                    <br />
                                    {/* 파일 유형에 따라 다른 내용을 렌더링 */}
                                    {msg.CHAT_CONDITION === 0 && (
                                        <>
                                            {msg.CHAT_TEXT}
                                            &nbsp;&nbsp;
                                            {msg.CHAT_REG_DATE}
                                        </>
                                    )}
                                    {msg.CHAT_CONDITION === 1 && (
                                        <>
                                            <img src={`http://localhost:3001/${msg.CHAT_IMAGE_NAME}`} alt="이미지" style={{ maxWidth: '200px' }} />
                                            &nbsp;&nbsp;
                                            {msg.CHAT_REG_DATE}
                                            <br />
                                            <button onClick={() => window.open(`http://localhost:3001/${msg.CHAT_IMAGE_NAME}`, '_blank')}>Download</button>
                                        </>
                                    )}
                                    {msg.CHAT_CONDITION === 2 && (
                                        <>
                                            <video width="320" height="240" controls>
                                                <source src={`http://localhost:3001/${msg.CHAT_VIDEO_NAME}`} type="video/mp4" />
                                            </video>
                                            &nbsp;&nbsp;
                                            {msg.CHAT_REG_DATE}
                                            <br />
                                            <button onClick={() => window.open(`http://localhost:3001/${msg.CHAT_VIDEO_NAME}`, '_blank')}>Download</button>
                                        </>
                                    )}
                                    {msg.CHAT_CONDITION === 3 && (
                                        <>
                                            <a href={`http://localhost:3001/${msg.CHAT_FILE_NAME}`} download>
                                                {msg.CHAT_FILE_NAME}
                                            </a>
                                            &nbsp;&nbsp;
                                            {msg.CHAT_REG_DATE}
                                            <br />
                                            <button onClick={() => window.open(`http://localhost:3001/${msg.CHAT_FILE_NAME}`, '_blank')}>Download</button>
                                        </>
                                    )}
                                </p>   
                            </div>
                        ))                        
                    )}
                </div>
            </div>
            <div>
                {/* 메시지 입력 영역 */}
                <input className="sendFileBtn" type="button" value="FILE" onClick={sendFileBtnClickHandler} />
                <input
                    className="inputMessageInput"
                    type="text"
                    name="chat_text"
                    value={inputMessage}
                    onChange={(e) => inputMessageOnchangeEventHandler(e)}
                />
                <button className="sendBtn" onClick={sendMessage}>Send</button>
            </div>
            {
                // 파일 모달
                isShowFileModal
                ?
                    <FileModal 
                        fileModalCloseBtnClickHandler={fileModalCloseBtnClickHandler}
                        isShowFileModal={isShowFileModal}
                        setIsShowFileModal={setIsShowFileModal}
                    />
                :
                    null
            }

            {
                isShowChatJoinUser
                ?
                    <>
                        {participants.map(participant => (
                            <div key={participant.USER_NO}>
                                <div>
                                    {participant.USER_NICKNAME}
                                </div>
                            </div> 
                        ))}
                        <button className="chatJoinUserCloseBtn" onClick={chatJoinUserCloseBtnClickHander}>CLOSE</button>
                    </>
                :
                    null
            }

            {
                // 친구 초대 모달
                isShowChatInviteFriendModal
                ?
                    <ChatDetailViewFriendModal 
                        handleFriendInviteModalClose={handleFriendInviteModalClose}
                        isShowChatInviteFriendModal={isShowChatInviteFriendModal}
                        setIsShowChatInviteFriendModal={setIsShowChatInviteFriendModal}
                        socket={socket} 
                        roomId={roomId}
                        participants={participants}
                    />
                :
                    null
            }
        </div>
    );
}
export default Chat;