import React, { useState } from 'react';
import socket from './socket';
import { generateRandomString } from '../../util/randomString';
import uploadFile from '../../util/uploadFileOpenChat'

const OpenChatAdd = ({ onLeave, userNo }) => {

    const [openRProfile, setOpenRProfile] = useState('');
    const [openRName, setOpenRName] = useState('');
    const [openRLimit, setOpenRLimit] = useState(50);
    const [openRIntro, setOpenRIntro] = useState('');
    const [profileType, setProfileType] = useState('default');
    const [newProfileImage, setNewProfileImage] = useState(null);
    const [newProfileNickname, setNewProfileNickname] = useState('');

    const handleCancelAddChatRoom = () => {
        onLeave();
    };

    const handleProfileTypeChange = (e) => {
        setProfileType(e.target.value);
    };

    const handleProfileChange = async (e) => {

        const file = e.target.files[0];
        try {
            const uploadedFile = await uploadFile(file);
            setOpenRProfile(uploadedFile.secure_url);
        } catch (error) {
            console.error('파일 업로드 실패:', error);
        }
    };

    const handleNewProfileImageChange = async (e) => {

        const file = e.target.files[0];
        
        if(file) {
            try {
                const uploadedFile = await uploadFile(file);
                setNewProfileImage(uploadedFile.secure_url);
            } catch (error) {
                console.error('파일 업로드 실패:', error);
            }
        } else {
            setOpenRProfile('');
        }

    };


    const handleNameChange = (e) => {
        setOpenRName(e.target.value);
    };

    const handleLimitChange = (e) => {
        setOpenRLimit(Number(e.target.value));
    };

    const handleIntroChange = (e) => {
        setOpenRIntro(e.target.value);
    };

    const handleNewProfileNicknameChange = (e) => {
        setNewProfileNickname(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (openRName.trim() === '') {
            alert('채팅방 이름을 입력해주세요.');
            return;
        }

        if (profileType === 'new') {
            if (!newProfileImage) {
                alert('새로운 프로필 사진을 등록해주세요.');
                return;
            }
            if (newProfileNickname.trim() === '') {
                alert('새로운 프로필 닉네임을 입력해주세요.');
                return;
            }

            const newOpenChat = {
                OPEN_R_ID: generateRandomString(80),
                OPEN_R_PROFILE: openRProfile,
                OPEN_R_NAME: openRName,
                OPEN_R_ADMIN_NO: userNo,
                OPEN_R_LIMIT: openRLimit,
                OPEN_R_INTRO: openRIntro,
                OPEN_P_NICKNAME: newProfileNickname,
                OPEN_P_PROFILE: newProfileImage
                
            };

            socket.emit('createOpenChat', newOpenChat);
            
        } else if(profileType === 'default') {
            const newOpenChat = {
                OPEN_R_ID: generateRandomString(80),
                OPEN_R_PROFILE: openRProfile,
                OPEN_R_NAME: openRName,
                OPEN_R_ADMIN_NO: userNo,
                OPEN_R_LIMIT: openRLimit,
                OPEN_R_INTRO: openRIntro,
                
            };

            socket.emit('createOpenChatOnDefault', newOpenChat);
            
    }
    
    setOpenRProfile('');
    setOpenRName('');
    setOpenRLimit(50);
    setOpenRIntro('');
    setProfileType('default');
    setNewProfileImage(null);
    setNewProfileNickname('');
    
    onLeave();
    };

    return (
        <div>
            <div>
                <h3>오픈채팅 생성</h3>
                <button onClick={handleCancelAddChatRoom}>X</button>
            </div>
            <div className="form">
                <form onSubmit={handleSubmit}>
                    <div>
                        <label>채팅방 이미지</label>
                        <input type="file" accept="image/*" onChange={handleProfileChange} />
                    </div>
                    <div>
                        <label>채팅방 이름</label>
                        <input type="text" value={openRName} onChange={handleNameChange} />
                    </div>
                    <div>
                        <label>인원 제한</label>
                        <div>
                            <label>
                                <input
                                    type="radio"
                                    value={25}
                                    checked={openRLimit === 25}
                                    onChange={handleLimitChange}
                                />
                                25명
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    value={50}
                                    checked={openRLimit === 50}
                                    onChange={handleLimitChange}
                                />
                                50명
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    value={100}
                                    checked={openRLimit === 100}
                                    onChange={handleLimitChange}
                                />
                                100명
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    value={200}
                                    checked={openRLimit === 200}
                                    onChange={handleLimitChange}
                                />
                                200명
                            </label>
                        </div>
                    </div>
                    <div>
                        <label>사용할 프로필</label>
                        <div>
                            <label>
                                <input
                                    type="radio"
                                    value="default"
                                    checked={profileType === 'default'}
                                    onChange={handleProfileTypeChange}
                                />
                                기본 프로필
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    value="new"
                                    checked={profileType === 'new'}
                                    onChange={handleProfileTypeChange}
                                />
                                새로운 프로필
                            </label>
                        </div>
                        {profileType === 'new' && (
                            <>
                                <div>
                                    <label>프로필 사진 등록</label>
                                    <input type="file" accept="image/*" onChange={handleNewProfileImageChange} />
                                </div>
                                <div>
                                    <label>닉네임 입력</label>
                                    <input type="text" value={newProfileNickname} onChange={handleNewProfileNicknameChange} />
                                </div>
                            </>
                        )}
                    </div>
                    <div>
                        <label>소개글</label>
                        <textarea value={openRIntro} onChange={handleIntroChange} />
                    </div>
                    <button type="submit">생성</button>
                </form>
            </div>
        </div>
    );
};

export default OpenChatAdd;