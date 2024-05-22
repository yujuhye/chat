import React, { useEffect, useRef, useState } from "react";
import { useParams } from 'react-router-dom';
import { fetchUser } from "./fetchFunction";
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { fileSend, fileSendSuccess, fileSendFail } from '../action/file';
import { setRooms, setLeaveRoom, setFavoriteRoom } from '../action/chatRoom';
import io from 'socket.io-client';
import axios from 'axios';
import '../../css/common.css';
import '../../css/chat/file.css';

const socket = io('http://localhost:3001');

const FileModal = ({ selectedRoom, fileModalCloseBtnClickHandler, isShowFileModal, setIsShowFileModal }) => {
    const selectImgFile = useRef("");
    const selectVideoFile = useRef("");
    const selectFile = useRef("");

    const { roomId } = useParams();

    const dispatch = useDispatch();
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [userInfo, setUserInfo] = useState(0);
    const sendSuccess = useSelector(state => state.file.sendSuccess);

    useEffect(() => {
        const refreshChatListListener = () => {
          const fetchRooms = async () => {
            try {
              const response = await axios.get('http://localhost:3001/chatRoom/list');
              console.log('파일 전송 후 확인 : ', response.data);
              console.log('파일 전송 후 확인 : ', response.data.rooms);
      
              // 가져온 채팅방 목록을 리덕스 스토어에 설정
              dispatch(setRooms(response.data.rooms));
            } catch (error) {
              console.error("채팅방 목록을 불러오는데 실패했습니다.", error);
            }
          };
      
          fetchRooms();
        };
      
        socket.on('refreshChatList', refreshChatListListener);
      
        // 컴포넌트가 언마운트될 때 이벤트 리스너를 제거
        return () => {
          socket.off('refreshChatList', refreshChatListListener);
        };
    }, [socket, dispatch]);

    // handler
    // 파일 선택
    const fileSelectChangeEventHandler = (e) => {
        console.log('fileSelect()');
        
        // multiple : 선택한 파일을 files로 인식
        const files = e.target.files;

        console.log('files -----> ', files);
        
        if(files.length > 0) {
            setSelectedFiles([...files]);
        }
        console.log('selectedFiles -----> ', selectedFiles);
    }

    // 파일 전송
    const fileSendBtnClickHandler = async () => {
        const roomId = selectedRoom.ROOM_NO;

        console.log('fileSend()');
        dispatch(fileSend());

        // 사용자 정보 불러오기
        const fetchAndSetUserInfo = async () => {
            try {
                const userData = await fetchUser(); // 사용자 정보를 비동기적으로 불러옴
                setUserInfo(userData);
                return userData; // userData 반환
            } catch (error) {
                alert(error.message);
                dispatch(fileSendFail(error.message)); // 파일 전송 실패 action dispatch
            }
        };

        const userInfo = await fetchAndSetUserInfo(); // 비동기 함수 호출하고 결과를 기다림

        if (!userInfo) {
            return; // 사용자 정보를 불러오지 못했으면 여기서 종료
        }

        let user = {
            userNo: userInfo.USER_NO,
            userId: userInfo.USER_ID,
            roomId: roomId,
        };
        console.log('이미지 전송 유저 번호 확인 -----> ', user);

        selectedFiles.forEach(file => {
            if(file.type.startsWith('image/')) {
                // 이미지 파일인 경우
                axiosImgFileSubmit([file], user, dispatch); 
            } else if(file.type.startsWith('video/')) {
                // 영상 파일인 경우
                axiosVideoFileSubmit([file], user, dispatch); 
            } else {
                // 기타 파일인 경우
                axiosFileSubmit([file], user, dispatch); 
            }
        });
    };

    // 이미지
    const axiosImgFileSubmit = (files, user, dispatch) => {
        console.log('axiosImgFile()');

        const formData = new FormData();

        files.forEach(file => {
            formData.append('chat_img_name', file);
            console.log('file -----> ', file);
        });
        formData.append('userNo', user.userNo);
        formData.append('userId', user.userId);
        formData.append('roomId', user.roomId);

        axios({
            url: `http://localhost:3001/chat/submitImgFiles`,
            method: 'post',
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data'
            },
        })
        .then(response => {
            console.log('파일 전송 성공!');
            //alert('파일 전송 성공!');
            console.log('then file submit success! -----> ', response.data);
            
            let submitInfo = {
                roomId: user.roomId,
                userId: user.userId,
                userNo: user.userNo,
                fileName: response.data.fileName,  // 서버로부터 받은 파일명
                fileUrl: response.data.fileUrl     // 서버로부터 받은 파일 URL
            }

            // socket
            socket.emit('submitFile', submitInfo);
            socket.on('roomInfo', function(roomInfo) {
                
                console.log('받은 채팅방 정보:', roomInfo);
       
            });

            dispatch(fileSendSuccess(response.data)); // 파일 전송 성공 action dispatch
            setIsShowFileModal(false);

        })
        .catch(error => {
            console.log('파일 전송 실패!');
            console.log('catch file submit fail! -----> ', error);
            setIsShowFileModal(false);
            dispatch(fileSendFail(error.message)); // 파일 전송 실패 action dispatch
        });
    };

    // 영상
    const axiosVideoFileSubmit = (files, user, dispatch) => {
        console.log('axiosVideoFileSubmit()');

        const formData = new FormData();

        files.forEach(file => {
            formData.append('chat_video_name', file);
            console.log('file -----> ', file);
        });
        formData.append('userNo', user.userNo);
        formData.append('userId', user.userId);
        formData.append('roomId', user.roomId);

        axios({
            url: `http://localhost:3001/chat/submitVideoFiles`,
            method: 'post',
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data'
            },
        })
        .then(response => {
            console.log('파일 전송 성공!');
            console.log('file submit success! -----> ', response.data);

            let submitInfo = {
                roomId: user.roomId,
                userId: user.userId,
                userNo: user.userNo,
                fileName: response.data.fileName,  // 서버로부터 받은 파일명
                fileUrl: response.data.fileUrl     // 서버로부터 받은 파일 URL
            }

            // socket
            socket.emit('submitFile', submitInfo);
            socket.on('roomInfo', function(roomInfo) {
                
                console.log('받은 채팅방 정보:', roomInfo);
       
            });

            setIsShowFileModal(false);
            dispatch(fileSendSuccess(response.data));
        })
        .catch(error => {
            console.log('파일 전송 실패!');
            console.log('file submit fail! -----> ', error);
            setIsShowFileModal(false);
            dispatch(fileSendFail(error.message));
        });

    }

    // 파일
    const axiosFileSubmit = (files, user, dispatch) => {
        console.log('axiosFileSubmit()');

        const formData = new FormData();

        files.forEach(file => {
            formData.append('chat_file_name', file);
            console.log('file -----> ', file);
        });
        formData.append('userNo', user.userNo);
        formData.append('userId', user.userId);
        formData.append('roomId', user.roomId);

        axios({
            url: `http://localhost:3001/chat/submitFiles`,
            method: 'post',
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data'
            },
        })
        .then(response => {
            console.log('파일 전송 성공!');
            console.log('file submit success! -----> ', response.data);

            let submitInfo = {
                roomId: user.roomId,
                userId: user.userId,
                userNo: user.userNo,
                fileName: response.data.fileName,  // 서버로부터 받은 파일명
                fileUrl: response.data.fileUrl     // 서버로부터 받은 파일 URL
            }

            // socket
            socket.emit('submitFile', submitInfo);
            socket.on('roomInfo', function(roomInfo) {
                
                console.log('받은 채팅방 정보:', roomInfo);
       
            });
            
            setIsShowFileModal(false);
            dispatch(fileSendSuccess(response.data));
        })
        .catch(error => {
            console.log('파일 전송 실패!');
            console.log('file submit fail! -----> ', error);
            setIsShowFileModal(false);
            dispatch(fileSendFail(error.message));
        });

    }

    useEffect(() => {
        socket.on('chatImgUploaded', (data) => {
            console.log('업로드 :', data);
        });
    
        return () => {
            socket.off('chatImgUploaded');
        };
    }, [socket]);
    
    return(
        <div className="fileModal">
            <input type="file" accept="image/*" name="chat_img_name" style={{ display: "none" }} multiple ref={selectImgFile} onChange={fileSelectChangeEventHandler}/>
            <input type="file" accept="video/*" name="chat_video_name" style={{ display: "none" }} multiple ref={selectVideoFile} onChange={fileSelectChangeEventHandler} />
            <input type="file" accept="application/pdf,application/zip,text/plain" name="chat_file_name" style={{ display: "none" }} multiple ref={selectFile} onChange={fileSelectChangeEventHandler} />
            <br />
            <button className="fileModalImgBtn" onClick={() => selectImgFile.current.click()}>IMG</button>
            <button className="fileModalVideoBtn" onClick={() => selectVideoFile.current.click()}>VIDEO</button>
            <button className="fileModalFileBtn" onClick={() => selectFile.current.click()}>FILE</button>

            {/* 선택된 파일 정보 */}
            {selectedFiles.length > 0 && (
                <div>
                    <p className="fileModalFile">FILE : </p>
                    <ul className="fileModalUl">
                        {selectedFiles.map((file, idx) => {
                            return <li name="submitFiles" key={idx}>{file.name}</li>
                        })}
                    </ul>
                </div>
            )}

            <br />
            <div className="fileBtns">
                <button className="fileModalSendBtn" onClick={fileSendBtnClickHandler}>SEND</button>
                <input className="fileModalCloseBtn" type="button" value="CLOSE" onClick={fileModalCloseBtnClickHandler}/>
            </div>
        </div>
    );
}

export default FileModal;
