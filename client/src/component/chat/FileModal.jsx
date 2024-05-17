import React, { useEffect, useRef, useState } from "react";
import { useParams } from 'react-router-dom';
import { fetchUser } from "./fetchFunction";
import { useDispatch } from 'react-redux';
import { fileSend, fileSendSuccess, fileSendFail } from '../action/file';
import axios from 'axios';
import '../../css/common.css'

const FileModal = ({ fileModalCloseBtnClickHandler, isShowFileModal, setIsShowFileModal }) => {
    const selectImgFile = useRef("");
    const selectVideoFile = useRef("");
    const selectFile = useRef("");

    const { roomId } = useParams();

    const dispatch = useDispatch();
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [userInfo, setUserInfo] = useState(0);

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
            console.log('then file submit success! -----> ', response.data);
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

    return(
        <div className="fileModal">
            <input type="file" accept="image/*" name="chat_img_name" style={{ display: "none" }} multiple ref={selectImgFile} onChange={fileSelectChangeEventHandler}/>
            <input type="file" accept="video/*" name="chat_video_name" style={{ display: "none" }} multiple ref={selectVideoFile} onChange={fileSelectChangeEventHandler} />
            <input type="file" accept="application/pdf,application/zip,text/plain" name="chat_file_name" style={{ display: "none" }} multiple ref={selectFile} onChange={fileSelectChangeEventHandler} />
            <br />
            <button onClick={() => selectImgFile.current.click()}>IMG</button>
            <button onClick={() => selectVideoFile.current.click()}>VIDEO</button>
            <button onClick={() => selectFile.current.click()}>FILE</button>

            {/* 선택된 파일 정보 */}
            {selectedFiles.length > 0 && (
                <div>
                    <p>FILE : </p>
                    <ul>
                        {selectedFiles.map((file, idx) => {
                            return <li name="submitFiles" key={idx}>{file.name}</li>
                        })}
                    </ul>
                </div>
            )}
            <button onClick={fileSendBtnClickHandler}>SEND</button>
            <input type="button" value="CLOSE" onClick={fileModalCloseBtnClickHandler}/>
        </div>
    );
}

export default FileModal;