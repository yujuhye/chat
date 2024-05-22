import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useLocation  } from 'react-router-dom';
import { setRooms } from '../action/chatRoom';
import axios from 'axios';
import io from 'socket.io-client';
import ChatDetailViewFriendModal from "./ChatDetailViewFriendModal";
import FileModal from "./FileModal";
import { fetchUser } from "./fetchFunction";
import '../../css/common.css';

import Profile from "./Profile";

const socket = io('http://localhost:3001');

const Chat = ({selectedRoom, setSelectedRoom, updateChatRooms}) => {
    const { roomId } = useParams();
    const dispatch = useDispatch();
    const searchInputRef = useRef(null);
    const messagesEndRef = useRef(null);
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
    const [isShowProfilePopup, setIsShowProfilePopup]                   = useState(false);
    const [selectedUserNo, setSelectedUserNo]                           = useState(null);
    const [notifications, setNotifications]                             = useState([]);
    const [userInfo, setUserInfo]                                       = useState('');
    const [blockFriend, setBlockFriend] = useState(''); 
    const [loggedInUserNo, setLoggedInUserNo] = useState(null); // 5/21 추가

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView(); 
    }

    useEffect(() => {
        scrollToBottom(); 
    }, [messages]);

    useEffect(() => {
        axiosGetBlockFriend();
    }, []);

    const toggleMenu = () => {
        console.log('toggleMenu()');
        setIsMenuOpen(!isMenuOpen);
    }
    
    const loadOldMessages = (messages) => {
        setMessages(messages);
    };

    // const receiveMessage = (data) => {
    //     const { sender, content, sentAt, status, userNo, readStatus, unreadCount } = data;
    //     console.log('보낸 메시지 상태 확인 -----> ', status);
    //     const newMessage = {
    //         USER_NICKNAME: sender,
    //         CHAT_TEXT: content,
    //         CHAT_REG_DATE: sentAt,
    //         CHAT_CONDITION: status,
    //         USER_NO: userNo,
    //         READ_STATUS: readStatus,
    //         UNREAD_COUNT: unreadCount,
    //     };
    //     console.log('채팅 로그 확인해보장 -----> ',newMessage);
    //     console.log('채팅 로그 확인해보장 READ_STATUS -----> ',newMessage.READ_STATUS);
    //     console.log('채팅 로그 확인해보장 UNREAD_COUNT -----> ',newMessage.UNREAD_COUNT);
    //     console.log('채팅 로그 확인해보장 USER_NO -----> ',newMessage.USER_NO);
    //     setMessages((prevMessages) => [...prevMessages, newMessage]); //newMessage를 추가
    // }; // 원본

    const receiveMessage = (data) => {
        const { sender, content, sentAt, status, userNo, readStatus, unreadCount } = data;
    
        console.log('콘솔밖 blockFriend>>>>>>>', blockFriend);
        console.log('콘솔밖 blockFriend[userNo]>>>>>>>', blockFriend[userNo]);

        // 차단된 친구인지 확인
        if (blockFriend && blockFriend[userNo]) {
            console.log('blockFriend>>>>>>>', blockFriend);
            return; // 메시지를 무시하고 함수 종료
        }
    
        console.log('보낸 메시지 상태 확인 -----> ', status);
        const newMessage = {
            USER_NICKNAME: sender,
            CHAT_TEXT: content,
            CHAT_REG_DATE: sentAt,
            CHAT_CONDITION: status,
            USER_NO: userNo,
            READ_STATUS: readStatus,
            UNREAD_COUNT: unreadCount,
        };
        console.log('채팅 로그 확인해보장 -----> ',newMessage);
        console.log('채팅 로그 확인해보장 READ_STATUS -----> ',newMessage.READ_STATUS);
        console.log('채팅 로그 확인해보장 UNREAD_COUNT -----> ',newMessage.UNREAD_COUNT);
        console.log('채팅 로그 확인해보장 USER_NO -----> ',newMessage.USER_NO);
        setMessages((prevMessages) => [...prevMessages, newMessage]); //newMessage를 추가
    };
        
    // 메시지 받기 원본
    // useEffect(() => {
    //     const handleMessageReceive = (messages) => {
    //         console.log(' ***** 채팅 로그 확인해보장 -----> ',messages);
    //         receiveMessage(messages);
    //     };
    //     socket.on('receiveMessage', handleMessageReceive); 
    //     return () => {
    //         socket.off('receiveMessage', handleMessageReceive);
    //     };
    // }, [socket]);    

    useEffect(() => {
        const handleMessageReceive = (messages) => {
            console.log(' ***** 채팅 로그 확인해보장 -----> ',messages);
            receiveMessage(messages);
        };
        socket.on('receiveMessage', handleMessageReceive); 
        return () => {
            socket.off('receiveMessage', handleMessageReceive);
        };
    }, [socket, blockFriend]);

    // 파일
    useEffect(() => {
        const fetchUserInfoAndJoinRoom = async () => {
            try {
                const userData = await fetchUser();
                setUserInfo(userData);
    
                const roomId = selectedRoom.ROOM_NO;
                const userNo = userData.USER_NO; 
    
                socket.emit('joinRoom', { roomId, userNo });
            } catch (error) {
                alert(error.message);
            }
        };
    
        fetchUserInfoAndJoinRoom();
    
        // 파일 정보 수신
        const handleReceiveFile = (data) => {
            console.log('파일 정보 수신:', data);
    
            const newMessage = {
                ...data.messages, // 기존 마지막 메시지 정보
            };
    
            setMessages(prevMessages => [...prevMessages, newMessage]);
        };
    
        socket.on('receiveFile', handleReceiveFile);

        return () => {
            socket.off('receiveFile', handleReceiveFile);
        };
    }, [selectedRoom.ROOM_NO, socket]);
    
    // 리스트 고치기
    useEffect(() => {
        const refreshChatListListener = async () => {
            try {
                const response = await axios.get('http://localhost:3001/chatRoom/list');
                console.log('chat list : ', response.data);
                console.log('채팅 리스트 room : ', response.data.rooms);
    
                // 가져온 채팅방 목록을 리덕스 스토어에 설정
                dispatch(setRooms(response.data.rooms));
            } catch (error) {
                console.error("채팅방 목록을 불러오는데 실패했습니다.", error);
            }
        };
    
        socket.on('refreshChatList', refreshChatListListener);
    
        // 컴포넌트가 언마운트될 때 이벤트 리스너를 제거
        return () => {
            socket.off('refreshChatList', refreshChatListListener);
        };
    }, [socket]); 

    useEffect(() => {
        console.log('현재 방에 참여한 유저 목록:', participants);
    
        // 읽음 상태 업데이트 요청하기
        //socket.emit('updateReadCnt', roomId, participants);
    
    }, [participants]);

    useEffect(() => {
        if (selectedRoom) {
            const roomId = selectedRoom.ROOM_NO;
            roomDetails(roomId);

            socket.on('loadOldMessages', loadOldMessages);
            socket.emit('joinRoom', roomId);

            return () => {
                socket.off('loadOldMessages', loadOldMessages);
            };
        }
    }, [selectedRoom, socket]);

    useEffect(() => {
        
        if (fileData) {
            console.log('File uploaded successfully', fileData);
            const roomId = selectedRoom.ROOM_NO;
            roomDetails(roomId);
        }

    }, [fileData, error]); 

    useEffect(() => {
        console.log('채팅 로그 업데이트됨 -----> ', messages);
    }, [messages]); 
    
    // 친구 초대 알림
    useEffect(() => {
        socket.on('invite-notification', (notificationMessage) => {
            console.log('알림 메시지 수신: ', notificationMessage); 
            //setNotifications(prevNotifications => [...prevNotifications, notificationMessage]);
        });
        return () => {
            socket.off('invite-notification');
        };
    }, [socket]);    

    useEffect(() => {
        const fetchAndSetUserInfo = async () => {
            try {
                const userData = await fetchUser();
                setUserInfo(userData);
                return userData.USER_NO;
            } catch (error) {
                alert(error.message);
                return null;
            }
        };
    
        fetchAndSetUserInfo().then((userNo) => {
            if (userNo) {
                const roomId = selectedRoom.ROOM_NO;
                console.log('Sending data to server: ', { roomId, userNo });
                socket.emit('joinRoom', { roomId, userNo });
            }
        });
    
    }, [selectedRoom.ROOM_NO]);    
    
    // 파일 받기 & 초대 메시지
    useEffect(() => {
        const handleReceiveFile = (data) => {
            console.log('파일 정보 수신:', data);
            const newMessage = { ...data.messages };
            setMessages(prevMessages => [...prevMessages, newMessage]);
        };
    
        const handleReceiveInviteMessage = (inviteMessage) => {
            console.log('Received an invite message:', inviteMessage);
            setMessages(prevMessages => [
                ...prevMessages,
                {
                    type: inviteMessage.type,
                    content: inviteMessage.content,
                    timestamp: inviteMessage.timestamp,
                    roomId: inviteMessage.roomId
                }
            ]);
        };
    
        socket.on('receiveFile', handleReceiveFile);
        socket.on('receiveInviteMessage', handleReceiveInviteMessage);
    
        return () => {
            socket.off('receiveFile', handleReceiveFile);
            socket.off('receiveInviteMessage', handleReceiveInviteMessage);
        };
    }, [socket]);    
    
    // 리스트 새로 고치기
    useEffect(() => {
        const refreshChatListListener = async () => {
            try {
                const response = await axios.get('http://localhost:3001/chatRoom/list');
                console.log('chat list : ', response.data);
                console.log('채팅 리스트 room : ', response.data.rooms);
    
                // 가져온 채팅방 목록을 리덕스 스토어에 설정
                dispatch(setRooms(response.data.rooms));
            } catch (error) {
                console.error("채팅방 목록을 불러오는데 실패했습니다.", error);
            }
        };
    
        socket.on('refreshChatList', refreshChatListListener);
    
        return () => {
            socket.off('refreshChatList', refreshChatListListener);
        };
    }, [socket]); 
    
    const inputMessageOnchangeEventHandler = (e) => {
        if (e.target.name === 'chat_text') {
            setInputMessage(e.target.value);
        }
    };

    // 메시지 전송 시 채팅리스트 새로 고침
    useEffect(() => {
        const refreshChatListListener = () => {
            const fetchRooms = async () => {
                try {
                    const response = await axios.get('http://localhost:3001/chatRoom/list');
                    console.log('chat list : ', response.data); 
                    console.log('채팅 리스트 room : ', response.data.rooms); 
    
                    // 가져온 채팅방 목록을 리덕스 스토어에 설정
                    dispatch(setRooms(response.data.rooms));
                
                } catch (error) {
                    console.error("채팅방 목록을 불러오는데 실패했습니다.", error);
                }
            };
            
            fetchRooms();
        };
      
        socket.on('refreshChatList', refreshChatListListener);

        // return () => {
        //   socket.off('refreshChatList', refreshChatListListener);
        // };
    }, []); 

    // 방나가기
    useEffect(() => {
        // 'userLeft' 이벤트를 수신하고 처리
        socket.on('userLeft', (notificationMessage) => {
            console.log('알림 메시지 수신: ', notificationMessage); // 디버깅 로그 추가
            // 알림을 추가
            setMessages(prevMessages => [
                ...prevMessages,
                `${notificationMessage.userNo}님이 ${notificationMessage.message}`
            ]);
        });
        return () => {
            
            socket.off('userLeft');
        };
    }, [socket]);

    const sendMessage = () => {
        if (!inputMessage.trim()) return;
        console.log('현재 방에 있는 사람 정보 -----> ', joinUserInfo);
        const roomId = selectedRoom.ROOM_NO;
        console.log('방!!!!!!번호!!!!!화긴!!!!! >>>>> ', roomId);
        socket.emit('sendMessage', { 
          sender: joinUserInfo[0]?.USER_NICKNAME, 
          userNo: joinUserInfo[0]?.USER_NO,  
          content: inputMessage, 
          roomId }, 
          (error) => {
            if (error) {
              alert(error);
            } 
            
        });        
        setInputMessage("");
    };

    const roomDetails = async (roomId) => {
        try {
            console.log('roomDetails()');
            const response = await axios.get(`http://localhost:3001/chat/details/${roomId}`, {
                params: { roomId },
            });
            const { participants, chatHistory } = response.data;

            console.log('★★★★★participants ----->', participants);
            console.log('★★★★★chatHistory ----->', chatHistory);

            setJoinUserInfo(participants);
            setMessages(chatHistory);

            const roomName = participants[0].PARTI_CUSTOMZING_NAME;
            console.log('채팅방 이름 -----> ', roomName);

            setRoomName(roomName);
        } catch (err) {
            console.error('채팅 정보를 가져오는데 오류가 발생했습니다.', err);
        }
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
        const roomId = selectedRoom.ROOM_NO;
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
                setLoggedInUserNo(joinUserInfo[0].USER_NO);
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
        const roomId = selectedRoom.ROOM_NO;
        if (roomId && joinUserInfo) {
          getJoinUser(joinUserInfo);
          console.log('*********** joinUserInfo *********', joinUserInfo);
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
        setSelectedRoom(null);

    }

    // 방나가기
    const leaveChatRoomBtnClickHandler = async () => {
        const roomId = selectedRoom.ROOM_NO;
        try {
            if (window.confirm('정말로 방을 나가시겠습니까?')) {
                const userData = await fetchUser();
                console.log('방나가기 이벤트 -----> ', userData);
                
                let chatInfo = {
                    id: roomId,
                    no: userData.USER_NO,
                }

                socket.emit('leaveRoom', chatInfo);
                console.log('방에서 나가기 이벤트 -----> ', chatInfo);
                setSelectedRoom(null);
                updateChatRooms();
            }
        } catch (error) {
            alert(error.message);
        }
    };

    useEffect(() => {
    
        // userLeft 이벤트에 대한 핸들러 등록
        socket.on('userLeft', (data) => {
            // 여기에 참여자 목록을 갱신하는 로직을 추가
            getJoinUser(joinUserInfo); // 참여자 목록 갱신
        });
   
        return () => {
            socket.off('userLeft');
        };
    }, []);    

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
        const roomId = selectedRoom.ROOM_NO;
        console.log('searchChatTextBtnClickHander()');
        if(!searchChatKey.trim()) {
            alert("검색어를 입력해주세요.");
            searchInputRef.current.focus();
            return;
        }
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
                }
                setSearChatKey('');
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

    // 이미지를 다운로드
    async function downloadImage(imageName) {
        try {
            // 이미지 파일의 URL을 구성
            const imageUrl = `http://localhost:3001/${imageName}`;
            // Fetch API를 사용하여 이미지를 Blob으로 가져옴
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            // Blob 객체로부터 URL을 생성
            const downloadUrl = URL.createObjectURL(blob);
            // 생성된 URL을 사용하여 다운로드 링크를 제공
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = imageName; // 다운로드할 파일의 이름 설정
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            // 사용이 끝난 URL 해제
            URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            console.error('이미지 다운로드 중 오류 발생:', error);
        }
    }

    // 영상 다운로드
    async function downloadVideo(videoName) {
        try {
            // 이미지 파일의 URL을 구성
            const videoUrl = `http://localhost:3001/${videoName}`;
            // Fetch API를 사용하여 이미지를 Blob으로 가져옴
            const response = await fetch(videoUrl);
            const blob = await response.blob();
            // Blob 객체로부터 URL을 생성
            const downloadUrl = URL.createObjectURL(blob);
            // 생성된 URL을 사용하여 다운로드 링크를 제공
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = videoName; // 다운로드할 파일의 이름 설정
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            // 사용이 끝난 URL 해제
            URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            console.error('영성 다운로드 중 오류 발생:', error);
        }
    }

    const nicknameClickHandler = (userNo) => {
        console.log('닉네임 클릭!!!!');
        console.log('닉네임 클릭!!!! 번호!', userNo);

        if (selectedUserNo === userNo) {
            setIsShowProfilePopup(prevState => !prevState);
        } else {
            setSelectedUserNo(userNo);
            setIsShowProfilePopup(true);
        }
    }

    //차단친구 가져오기
    function axiosGetBlockFriend() {
        console.log('**********************axiosGetBlockFriend()');

        axios({
            url: 'http://localhost:3001/friend/blockFriend',
            method: 'get',
        })
        .then(response => {
            console.log('axiosGetBlockFriend success', response.data);

            if(response.data !== null ) {

                const blockFriendObj = response.data.reduce((obj, blockFriend) => {
                    obj[blockFriend.FRIEND_NO] = {
                        blockFriendNo: blockFriend.FRIEND_NO,
                        blockFriendId: blockFriend.FRIEND_TARGET_ID,
                        blockFriendName: blockFriend.FRIEND_TARGET_NAME,
                        blockFriendImg: blockFriend.USER_FRONT_IMG_NAME,
                    };
                    return obj;
                }, {});

                setBlockFriend(blockFriendObj);

            } else {
                setBlockFriend('');
            }
            

        })
        .catch(error => {
            console.log('axiosGetBlockFriend error -----> ', error);
            
        })
        .finally(data => {
            console.log('axiosGetBlockFriend complete -----> ', data);
            
        });

    }
    
    return (
        <div id="chatWrap">
            <h2 className="roomName">{roomName}</h2>
            {/* 메뉴바 추가 */}
            <div className="chatMenu">
                <input type="text" name="chat_text" value={searchChatKey} onChange={(e)=>searchChatTextChangeHander(e)} ref={searchInputRef} className="chatSearchInput" />
                <button className="searchChatTextBtn" onClick={searchChatTextBtnClickHander}>SEARCH</button>
                <button className="hamburgerButton" onClick={toggleMenu}>메뉴</button>
                <div className={`menuContent ${isMenuOpen ? 'show' : ''}`}>
                    <button className="chatJoinUser" onClick={joinChatUserListClickHandler}>참여자 목록</button>
                    <button className="chatInviteUser" onClick={thisChatInviteFriendClickHandler}>친구 초대</button>
                    <button className="chatQuitChatRoom" onClick={leaveChatRoomBtnClickHandler}>나가기</button>
                    <button className="chatList" onClick={locationChatListBtnClickHandler}>리스트</button>
                </div>
            </div>
            <div id="messageWrap">
                <div className="messageWrap">
                    <div id="messageContainer">
                        {notifications.map((message, index) => (
                            <div key={index} className="notification">
                                {message}
                            </div>
                        ))}
                    </div>
                    {searchResult.length > 0 ? (
                        <>
                            {searchResult.map((msg, index) => (
                                <div key={index} className="msg">
                                    <p className="chatPTag">
                                        <strong className="userNickname">{msg.USER_NICKNAME}</strong>
                                        <br />
                                        <span className="msgContent">{msg.CHAT_TEXT}</span>
                                        &nbsp;&nbsp;
                                        <span className="msgRegDate">{msg.CHAT_REG_DATE}</span>
                                    </p>   
                                </div>
                            ))}
                            <div id="chatCloseBtn">
                                <button className="chatCloseBtn" onClick={searchCancelBtnClickHander}>취소</button>
                            </div>
                        </>
                    ) : (
                        <>
                            {messages && messages.map((msg, index) => (
                                <div key={index} className="msg">
                                    {msg.content}
                                    <p className="chatPTag">
                                        <strong className="userNickname">{msg.USER_NICKNAME}</strong>
                                        <br />
                                        {/* 유형에 따라 다른 내용을 렌더링 */}
                                        {msg.CHAT_CONDITION === 0 && (
                                            <>
                                                <span className="msgContent">{msg.CHAT_TEXT}</span>
                                                &nbsp;&nbsp;
                                                <span className="msgRegDate">{msg.CHAT_REG_DATE}</span>
                                            </>
                                        )}
                                        {msg.CHAT_CONDITION === 1 && (
                                            <>
                                                <span className="msgContent">
                                                    <img src={`http://localhost:3001/${msg.CHAT_IMAGE_NAME}`} alt="이미지" style={{ maxWidth: '200px' }} className="chatImg"/>
                                                </span>
                                                <br />
                                                
                                                <br />
                                                <span className="msgRegDate">{msg.CHAT_REG_DATE}</span>
                                                <button onClick={() => downloadImage(msg.CHAT_IMAGE_NAME)} className="chatImgDownload">Download</button>
                                            </>
                                        )}
                                        {msg.CHAT_CONDITION === 2 && (
                                            <>
                                                <span className="msgContent">
                                                    <video width="320" height="240" controls className="chatVideo">
                                                        <source src={`http://localhost:3001/${msg.CHAT_VIDEO_NAME}`} type="video/mp4" />
                                                    </video>
                                                </span>
                                                &nbsp;&nbsp;
                                                <span className="msgRegDate">{msg.CHAT_REG_DATE}</span>
                                                <br />
                                                <button onClick={() => downloadVideo(msg.CHAT_VIDEO_NAME)} className="chatVideoDownload">Download</button>
                                            </>
                                        )}
                                        {msg.CHAT_CONDITION === 3 && (
                                            <>
                                                <span className="msgContent">
                                                    <a href={`http://localhost:3001/${msg.CHAT_FILE_NAME}`} download>
                                                        {msg.CHAT_FILE_NAME}
                                                    </a>
                                                </span>
                                                &nbsp;&nbsp;
                                                <span className="msgRegDate">{msg.CHAT_REG_DATE}</span>
                                                <br />
                                                <button onClick={() => window.open(`http://localhost:3001/${msg.CHAT_FILE_NAME}`, '_blank')} className="chatFileDownload">Download</button>
                                            </>
                                        )}
                                    </p>   
                                </div>
                            ))}
                        </>
                    )}
                </div>
            <div ref={messagesEndRef} />
        </div>
            <div>
                {/* 메시지 입력 영역 */}
                <input 
                    className="sendFileBtn" 
                    type="button" 
                    value="FILE" 
                    onClick={sendFileBtnClickHandler} 
                />
                <input
                    className="inputMessageInput"
                    type="text"
                    name="chat_text"
                    value={inputMessage}
                    onChange={(e) => inputMessageOnchangeEventHandler(e)}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            sendMessage();
                            e.preventDefault();
                        }
                    }}
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
                        selectedRoom={selectedRoom}
                    />
                :
                    null
            }

            {
                isShowChatJoinUser
                ?
                    <>
                        <div id="chatJoinUserList">
                            {participants.map(participant => (
                                <div key={participant.USER_NO} className="chatJoinUserList">
                                    <div className="chatJoinUserProfile" onClick={()=>nicknameClickHandler(participant.USER_NO)}>
                                        {participant.USER_NICKNAME}
                                    </div>
                                </div> 
                            ))}
                            <button className="chatJoinUserCloseBtn" onClick={chatJoinUserCloseBtnClickHander}>CLOSE</button>
                        </div>
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
                        selectedRoom={selectedRoom}
                        participants={participants}
                    />
                :
                    null
            }

            {
                isShowProfilePopup
                ?
                <>
                    <Profile 
                        onClose={() => setIsShowProfilePopup(false)} 
                        selectedUserNo={selectedUserNo}
                    />
                </>
                :
                <></>
            }
        </div>
    );
}
export default Chat;