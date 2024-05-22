import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import  '../../css/profile.css';
import '../../css/chat/Profile.css';

import io from 'socket.io-client';

const socket = io('http://localhost:3001');

const Profile = ({ onClose, selectedUserNo }) => {

    const navigate = useNavigate();
    const [requestMessage, setRequestMessage] = useState('');

    const [profile, setProfile] = useState(null); // 프로필 정보 상태
    const [isLoading, setIsLoading] = useState(false);
    const [userInfo, setUserInfo] = useState('');

    const selectedFriendId = useSelector(state => state['friend']['selectedFriend']);
    const friends = useSelector(state => state['friend']['friends']);

    const friendDetails = Object.values(friends).find(friend => friend.id === selectedFriendId);

    // 컴포넌트가 마운트될 때 사용자 정보를 가져옴
    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = () => {
        axios({
            url: `http://localhost:3001/chatRoom/getUserInfo`,
            method: 'get',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then(response => {
            if (response.data) {
                setUserInfo(response.data);
                console.log('user info -----> ', response.data);
            } else {
                alert('[FriendListModal] user 정보를 불러오는 데 실패했습니다.');
            }
        })
        .catch(error => {
            alert(`[FriendListModal] fetchUser Error: ${error.message}`);
        });
    };

    // 채팅 버튼 클릭 핸들러
    const chatBtnClickHandel = (friendNo, friendName) => {
        if (!userInfo) {
            alert('사용자 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
            return;
        }

        console.log('유저 정보!', userInfo);
        console.log('chatBtnClickHandel()', userInfo, friendNo, friendName);
        createChatRoom(userInfo, friendNo, friendName);
        
    };

    // 채팅방 생성 로직 (소켓 통신)
    const createChatRoom = (userInfo, friendNo, friendName) => {
        const roomName = `${userInfo.USER_NICKNAME}, ${friendName}`;

        socket.emit('chatRoomCreated', {
            userInfo,
            friendNo,
            friendName,
            roomName,
        });
    };

    // 소켓 이벤트 리스너 설정
    useEffect(() => {
        fetchUser();

        socket.on('roomCreated', (data) => {
            console.log('Chat room created', data);
        });

        socket.on('error', (error) => {
            console.error('Error creating chat room:', error);
        });

        return () => {
            socket.off('roomCreated');
            socket.off('error');
        };
    }, []);

    useEffect(() => {
        setIsLoading(true);
        axiosGetMyProfile();
    }, [selectedUserNo]);

    useEffect(() => {
        axiosGetMyProfile(); // 컴포넌트 마운트 시 프로필 정보 가져오기
    }, []);

    // 프로필 가져오기
    const axiosGetMyProfile = () => {
        console.log('axiosGetMyProfile');

        let params = {
            selectedUserNo: selectedUserNo,
        }

        console.log('선택한 유저 -----> ',params);

        axios({
            url: 'http://localhost:3001/chat/profile',
            method: 'get',
            params: params,
        })
        .then(response => {
            console.log('axiosGetMyProfile success', response.data);
            setProfile(response.data); // 프로필 정보 상태 업데이트

            console.log('axiosGetMyProfile success', profile);
        })
        .catch(error => {
            console.log('axiosGetMyProfile error');
        })
        .finally(() => {
            console.log('axiosGetMyProfile complete');
        });
    }

    // 친구 추가 버튼 클릭
    const addFriendClickHandler = (reqId, reqName) => {
        console.log(`addFriendClickHandler()`);
        
        axiosRequestFriend(reqId, reqName);
    };

    //친구요청 
    function axiosRequestFriend(reqId, reqName) {
        console.log('axiosRequestFriend()');

        let formData = {
            'friendId': reqId,
            'friendName': reqName,
            'reqMessage': requestMessage,
        }

        axios({
            url: 'http://localhost:3001/friend/requestFriend',
            method: 'post',
            data: formData
        })
        .then(response => {
            console.log('axiosRequestFriend success', response.data);

            
            if(response.data > 0 ) {

                alert('친구요청에 성공하였습니다.');
                navigate('/friend/friendList');
    
            } else {
                alert('친구요청에 실패하였습니다.');
                navigate('/friend/requestFriend')
            }

        })
        .catch(error => {
            console.log('axiosRequestFriend error');
            
        })
        .finally(data => {
            console.log('axiosRequestFriend complete');
            
        });


    }

    return (
        <>
            {profile ? (
                <div id="chatProfileWrap">
                    <p className="chatProfilePTag">
                        <span className="chatProfileSpanTag">
                            {profile.USER_FRONT_IMG_NAME ? (
                                <img src={profile.USER_FRONT_IMG_NAME} className="myFrontProfileImg" />
                            ) : (
                                <img src="/resource/img/profile_default.png" className="myFrontProfileImg" />
                            )}
                        </span>
                        &nbsp;&nbsp;
                        {profile.USER_NICKNAME}
                    </p>
                    {profile.USER_NO !== userInfo.USER_NO && (
                        profile.isFriend ? (
                            <input
                                className="chatStartInChatView"
                                type="button"
                                name="friendChatting"
                                value="채팅"
                                onClick={() => chatBtnClickHandel(profile.USER_NO, profile.USER_NICKNAME)}
                            />
                        ) : (
                            <input
                                className="friendReqInChatView"
                                type="button"
                                name="addFriend"
                                value="친구 신청"
                                onClick={() => addFriendClickHandler(profile.USER_ID, profile.USER_NICKNAME)}
                            />
                        )
                    )}
                </div>
            ) : (
                <p className="loadingChatProfile">프로필 정보를 불러오는 중...</p>
            )}
        </>
    );    

};

export default Profile;
