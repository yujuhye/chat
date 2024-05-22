import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { myProfileAction, selectedMyProfileId } from "../action/friendList";
import axios from "axios";

import  '../../css/profile.css';
import  '../../css/common.css';
import { Link } from "react-router-dom";
import MyProfileDetails from "./MyProfileDetails";
import { SERVER_URL } from "../../util/url";

function MyProfile() {

    const dispatch = useDispatch();
    const myProfile = useSelector(state => state['friend']['myprofile']);
    const selectedMine = useSelector(state => state['friend']['selectedMine']);

    useEffect(() => {
        console.log('[MyProfile] useEffect');

        axiosGetMyProfile();

    }, [dispatch]);

    //내 프로필 클릭시
    const myProfileClickHandler = (myId) => {
        console.log('myProfileClickHandler()');

        // dispatch(selectedMyProfileId(myId));

        if (selectedMine === myId) {
            dispatch(selectedMyProfileId(null));
        } else {
            dispatch(selectedMyProfileId(myId));
        }
    }

     //내 프로필 가져오기
     const axiosGetMyProfile = () => {
        console.log('axiosGetMyProfile');

        axios({
            // url: 'http://localhost:3001/friend/myProfile',
            url: `${SERVER_URL.TARGET_URL()}/friend/myProfile`,
            method: 'get',
            // params: {
            //     'user_id': 'gildong',
            // }
        })
        .then(response => {
            console.log('axiosGetMyProfile success', response.data);

            const myprofileObj = response.data.reduce((obj, myprofile) => {
                obj[myprofile.USER_NO] = {
                    id: myprofile.USER_ID,
                    name: myprofile.USER_NICKNAME,
                    curMsg: myprofile.USER_CUR_MSG,
                    frontImg: myprofile.USER_FRONT_IMG_NAME,
                    backImg: myprofile.USER_BACK_IMG_NAME,
                };
                return obj;
            }, {});

            dispatch(myProfileAction(myprofileObj));

        })
        .catch(error => {
            console.log('axiosGetMyProfile error');
            
        })
        .finally(data => {
            console.log('axiosGetMyProfile complete');
            
        });
    }

    return(
        <>
        <div className="myProfileContainer">
            <div className="myProfileWrap">
                <ul className="myProfileListWrap">
                    {Object.keys(myProfile).map((profileId, index) => (
                        // <div className="myProfileList">
                        <div className={`myProfileList ${selectedMine === myProfile[profileId].id ? "selected" : ""}`} >
                        <li key={index} className="myProfile" onClick={()=>myProfileClickHandler(myProfile[profileId].id)}>
                            {
                                myProfile[profileId].frontImg === ''
                                ?
                                    <>
                                        <img src="/resource/img/profile_default.png" className="myFrontProfileImgs"/>
                                    </>
                                :
                                    <>
                                        <img src={`http://localhost:3001/${myProfile[profileId].id}/${myProfile[profileId].frontImg}`} className="myFrontProfileImgs"/>
                                    </>
                            }
                            <span className="myProfileName">{myProfile[profileId].name}</span>
                            <span className="myCurMsg">{myProfile[profileId].curMsg}</span>
                        </li>
                        </div>
                        // </div>
                    ))}
                </ul>
            </div>
            <div className="myProfileDetailsWrap">
            {
              selectedMine === null
              ?
              <></>
              :
              <MyProfileDetails />
            }
            </div>
            </div>
            </>
    );
}

export default MyProfile;