import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import $ from 'jquery';

import '../../css/myProfile.css';
import axios from "axios";
import { IoMdClose, IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { MdPhotoCameraBack } from "react-icons/md";
import { FaCameraRetro } from "react-icons/fa";
import { IoCheckmarkSharp } from "react-icons/io5";
import { SERVER_URL } from "../../util/url";

function MyProfileDetails() {

    const selectedMyId = useSelector(state => state['friend']['selectedMine']);
    const myProfile = useSelector(state => state['friend']['myprofile']);

    const myDetails = Object.values(myProfile).find(myProfile => myProfile.id === selectedMyId);
    
    const [showEditMyProfile, setShowEditMyProfile] = useState(false);
    const [profileName, setProfileName] = useState('');           //프로필 이름
    const [profilMessage, setProfilMessage] = useState('');       //프로필 상태메세지
    const [showModal, setShowModal] = useState(false);            //프로필모달
    const [frongImages, setFrongImages] = useState([]);
    const [curIndex, setCurIndex] = useState(0);                  //프로필 인덱스
    const [showBackModal, setShowBackModal] = useState(false);
    const [backImges, setbackImges] = useState([]);
    const [curBackIndex, setCurBackIndex] = useState(0);
    
    useEffect(() => {
        if (myDetails) {
            setProfileName(myDetails.name);
            setProfilMessage(myDetails.curMsg ? myDetails.curMsg  : '');
        }
    }, [myDetails]); 


    if(!selectedMyId || !myDetails) {
        return null;
    }

    //프로필 편집 버튼클릭시
    const editMyProfileBtnClickHandler = () => {
        console.log('editMyProfileBtn ClickHandler()');

        setShowEditMyProfile(true);
    }

    //프로필 정보
    const myProfileInfoChangeHandler = (e) => {
        console.log('myProfileInfoChangeHandler');

        const inputName = e.target.name;
        const inputValue = e.target.value;

        if(inputName ==='profileName') {
            setProfileName(inputValue);
        } else if(inputName === 'profileMessage') {
            setProfilMessage(inputValue);
        } 
       
    }

    //수정 완료버튼 클릭시
    const editSubmitBtnClickHandler = () => {
        console.log('editSubmitBtnClickHandler()');

        if(profileName === '') {
            alert('프로필 이름을 입력해주세요');
        } else {
            axiosEditSubmit();
        }
    }

    //기본배경화면 클릭시
    const defaulctBackImgClickHandler = () => {
        console.log('defaulctBackImgClickHandler');

        if(window.confirm('기본 배경화면으로 전환하시겠습니까?')) {
            axisDefaultBackImg();
        }

    }

    //기본프로필 클릭시
    const defaultFrontImgClickHandler = () => {
        console.log('defaultFrontImgClickHandler');

        if(window.confirm('기본 프로필로 전환하시겠습니까?')) {
            axisDefaultFrontImg();
        }
    }

    //프로필 이미지 클릭시
    const myProfileImgsClickHandler = () => {
        console.log('myProfileImgsClickHandler()');

        axiosGetMyProfileImgs();
    }
    //배경 이미지 클릭시
    const myBackImgsClickHandler = () => {
        console.log('myBackImgsClickHandler()');

        axiosGetMyBackImgs();
    }
    
    //next버튼 클릭시
    const nextImageClickHandler = () => {
        console.log('nextImageClickHandler');
        setCurIndex((curIndex + 1) % frongImages.length);
        console.log('###', frongImages[curIndex].PROFILE_NAME)

    }

    //prev버튼 클릭시
    const PrevImageClickHandler = () => {
        console.log('PrevImageClickHandler()');
        setCurIndex((curIndex) => (curIndex === 0 ? frongImages.length - 1 : curIndex - 1));
        console.log('###', frongImages[curIndex].PROFILE_NAME)
    }

    //back next버튼 클릭시
    const nextBackImageClickHandler = () => {
        console.log('nextBackImageClickHandler');
        setCurBackIndex((curBackIndex + 1) % backImges.length);
        console.log('back>>', backImges[curBackIndex].PROFILE_NAME)
    }

    //back prev버튼 클릭시
    const PrevBackImageClickHandler = () => {
        console.log('PrevBackImageClickHandler()');
        setCurBackIndex((curBackIndex) => (curBackIndex === 0 ? backImges.length - 1 : curBackIndex - 1));
        console.log('back>>', backImges[curBackIndex].PROFILE_NAME)
    }

    //수정완료
    function axiosEditSubmit() {
        console.log('axiosEditSubmit()');

        let uFrontImgName = $('input[name="uFrontImgName"]');
        let frontFiles = uFrontImgName[0].files;
        let profileBackImg = $('input[name="profileBackImg"]');
        let backFiles = profileBackImg[0].files;

        let formData = new FormData();
        formData.append("userId", selectedMyId);
        formData.append("profileName", profileName);
        // formData.append("uFrontImgName", frontFiles[0]);
        // formData.append("profileBackImg", backFiles[0]);
       
        if(profilMessage !== '') {
            formData.append("profilMessage", profilMessage);
        }
       
        if (frontFiles.length > 0) {
            formData.append("uFrontImgName", frontFiles[0]);
        } else {
            formData.append("uFrontImgName", undefined);
        }
        
        if (backFiles.length > 0) {
            formData.append("profileBackImg", backFiles[0]);
        } else {
            formData.append("profileBackImg", undefined);
        }

        axios({
            // url: 'http://localhost:3001/friend/myProfileEdit',
            url: `${SERVER_URL.TARGET_URL()}/friend/myProfileEdit`,
            method: 'put',
            data: formData,
        })
        .then(response => {
            console.log( 'axiosEditSubmit success', response.data );
               
            if(response.data > 0) {
                alert('프로필편집이 완료되었습니다');
                window.location.reload('/friend/friendList');
            } else {
                alert('프로필편집에 실패하였습니다');
                window.location.reload('/friend/friendList');
            }

        })

        .catch(error => {
            console.log( ' axiosEditSubmit error' );
        })
        .finally(data => {
            console.log( ' axiosEditSubmit complete' );
        })

    }

    //기본배경화면
    function axisDefaultBackImg() {
        console.log('axisDefaultBackImg()');

        axios({
            // url: 'http://localhost:3001/friend/myBackDefaultImg',
            url: `${SERVER_URL.TARGET_URL()}/friend/myBackDefaultImg`,
            method: 'put',
        })
        .then(response => {
            console.log( 'axisDefaultBackImg success', response.data );
               
            if(response.data > 0) {
                alert('기본 배경화면으로 전환되었습니다');
                window.location.reload('/friend/friendList');
            } else {
                alert('기본 배경화면 전환에 실패하였습니다.');
                window.location.reload('/friend/friendList');
            }

        })

        .catch(error => {
            console.log( ' axisDefaultBackImg error' );
        })
        .finally(data => {
            console.log( ' axisDefaultBackImg complete' );
        })

    }

    //기본프로필
    function axisDefaultFrontImg() {
        console.log('axisDefaultFrontImg()');

        axios({
            // url: 'http://localhost:3001/friend/myFrontDefaultImg',
            url: `${SERVER_URL.TARGET_URL()}/friend/myFrontDefaultImg`,
            method: 'put',
        })
        .then(response => {
            console.log( 'axisDefaultFrontImg success', response.data );
               
            if(response.data > 0) {
                alert('기본 프로필로 전환되었습니다');
                window.location.reload('/friend/friendList');
            } else {
                alert('기본 프로필 전환에 실패하였습니다.');
                window.location.reload('/friend/friendList');
            }

        })

        .catch(error => {
            console.log( ' axisDefaultFrontImg error' );
        })
        .finally(data => {
            console.log( ' axisDefaultFrontImg complete' );
        })


    }

    //프로필 이미지들 
    async function axiosGetMyProfileImgs() {
        console.log('axiosGetMyProfileImgs');

        try {
            const response = await axios.get(
                // 'http://localhost:3001/friend/getMyProfileImgs', 
                `${SERVER_URL.TARGET_URL()}/friend/getMyProfileImgs`,

                {

            });
            console.log('axiosGetMyProfileImgs success', response.data);
            if(response.data !== null) {
                setFrongImages(response.data);
                setShowModal(true);
            } else {
                setFrongImages(null);
                setShowModal(true);
            }
           
            
        } catch (error) {
            console.log('axiosGetMyProfileImgs error');
        }
    }

    //배경 이미지들
    async function axiosGetMyBackImgs() {
        console.log('axiosGetMyBackImgs()');

        try {
            const response = await axios.get(
                // 'http://localhost:3001/friend/getMyBackImgs',
                `${SERVER_URL.TARGET_URL()}/friend/getMyBackImgs`,
                 {

            });
            console.log('axiosGetMyBackImgs success', response.data);
            if(response.data !== null) {
                setbackImges(response.data);
                setShowBackModal(true);
            } else {
                setbackImges(null);
                setShowBackModal(true);
            }
            
        } catch (error) {
            console.log('axiosGetMyBackImgs error');
        }


    }

    return(
        <div className="myProfileDetailsContainer">
            {
                showEditMyProfile 
                ?
                <>
                <div className="backFileLogoWrap">
                    <input type="file" id="backImgFile" name="profileBackImg" style={{display:"none"}}/>
                    <label className="backImgLogo" for="backImgFile"><MdPhotoCameraBack size="1.8em"/></label>
                    <span className="imgDropdown">
                    <button className="dropbtn">기본</button>
                        <div className="dropdownProfile">
                            <button onClick={defaultFrontImgClickHandler}>기본프로필</button>
                            <button onClick={defaulctBackImgClickHandler}>기본배경</button>
                        </div>
                    </span>
                </div>
                <img className="myProfileDetailsFrontImg" src={myDetails.frontImg 
                    ? 
                    `http://localhost:3001/${selectedMyId}/${myDetails.frontImg}` 
                    : 
                    "/resource/img/profile_default.png"} 
                />
                <div
                    className="myProfileDetailsBackImg"
                    style={{
                        backgroundImage: `url(${
                        myDetails.backImg
                            ? `http://localhost:3001/${selectedMyId}/${myDetails.backImg}`
                            : "/resource/img/default_back_img.jpg"
                        })`
                    }}
                ></div>
                <span>
                    <input type="file" id="frontImgFile" name="uFrontImgName" style={{display:"none"}}/>
                    <label className="frontImgLogo" for="frontImgFile"><FaCameraRetro size="1.6em"/></label>
                </span>
                <div>
                    <input className="myProfileEditName" type="text" name="profileName" 
                    value={profileName} placeholder="이름을 입력해주세요" readOnly  onChange={(e) => myProfileInfoChangeHandler(e)}
                    />
                </div>
                <div>
                    <input className="myProfileEditName" type="text" name="profileMessage" 
                    value={profilMessage} placeholder="상태메세지를 입력해주세요" onChange={(e) => myProfileInfoChangeHandler(e)}
                    />
                </div>
                <div>
                    <IoCheckmarkSharp className="completeBtn" size="2.5em" onClick={editSubmitBtnClickHandler} />
                </div>
                </> 
                :
                <>
                <img onClick={myProfileImgsClickHandler} className="myProfileDetailsFrontImg" src={myDetails.frontImg 
                    ? 
                    `http://localhost:3001/${selectedMyId}/${myDetails.frontImg}` 
                    : 
                    "/resource/img/profile_default.png"}  
                />
                <div className="modal">
                    {
                        showModal 
                        ?
                       <div className="modalImg">
                            <div className="modalWrap">
                                <div className="closeBtn">
                                    <IoMdClose  size="4em"  onClick={() => setShowModal(false)}/>
                                </div>
                                {
                                    frongImages !== null 
                                    ?
                                    (frongImages.length > 1
                                    ?
                                    <>
                                        <IoIosArrowBack className="prevBtn" size="6em" onClick={PrevImageClickHandler} />
                                        <IoIosArrowForward className="nextBtn" size="6em" onClick={nextImageClickHandler} />
                                        <img src= {`http://localhost:3001/${selectedMyId}/${frongImages[curIndex].PROFILE_NAME}`}/>
                                    </>
                                    :
                                    <img src= {`http://localhost:3001/${selectedMyId}/${frongImages[curIndex].PROFILE_NAME}`}/>)
                                    :
                                    <img src="/resource/img/profile_default.png"/>
                                }
                            </div>
                       </div>
                        :
                        <>
                        </>
                    }
                </div>
                <div
                    className="myProfileDetailsBackImg"
                    onClick={myBackImgsClickHandler}
                    style={{
                        backgroundImage: `url(${
                        myDetails.backImg
                            ? `http://localhost:3001/${selectedMyId}/${myDetails.backImg}`
                            : "/resource/img/default_back_img.jpg"
                        })`
                    }}
                ></div>
                <div className="modal">
                    {
                        showBackModal 
                        ?
                       <div className="modalImg">
                            <div className="modalWrap">
                                <div className="closeBtn">
                                    <IoMdClose  size="4em"  onClick={() => setShowBackModal(false)}/>
                                </div>
                                {
                                    backImges !== null 
                                    ?
                                    (backImges.length > 1
                                    ?
                                    <>
                                        <IoIosArrowBack className="prevBtn" size="6em" onClick={PrevBackImageClickHandler} />
                                        <IoIosArrowForward className="nextBtn" size="6em" onClick={nextBackImageClickHandler} />
                                        <img src= {`http://localhost:3001/${selectedMyId}/${backImges[curBackIndex].PROFILE_NAME}`}/>
                                    </>
                                    :
                                    <img src= {`http://localhost:3001/${selectedMyId}/${backImges[curBackIndex].PROFILE_NAME}`}/>)
                                    :
                                    <img src="/resource/img/default_back_img.jpg"/>
                                }
                            </div>
                       </div>
                        :
                        <>
                        </>
                    }
                </div>
                <div className="myProfileDetailsName">
                    {myDetails.name}
                </div>
                <div className="myProfileDetailsMsg">
                    {myDetails.curMsg}
                </div>
                <div>
                    <input className="editProfileBtn" type="button" value="프로필편집" onClick={editMyProfileBtnClickHandler} />
                </div>
                </>
            }
          
        </div>
    );
}

export default MyProfileDetails;