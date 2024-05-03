import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { myProfileAction } from "../action/friendList";
import axios from "axios";

import  '../../css/profile.css';
import  '../../css/common.css';

function MyProfile() {

    const dispatch = useDispatch();
    const myProfile = useSelector(state => state['friend']['myprofile']);

    useEffect(() => {
        console.log('[MyProfile] useEffect');

        axiosGetMyProfile();
    }, [dispatch]);


     //내 프로필 가져오기
     const axiosGetMyProfile = () => {
        console.log('axiosGetMyProfile');

        axios({
            url: 'http://localhost:3001/friend/myProfile',
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
             <h3>나의 프로필</h3>
             <ul>
                {Object.keys(myProfile).map((profileId, index) => (
                    <li key={index} className="profile">
                        {
                            myProfile[profileId].frontImg === ''
                            ?
                                <>
                                    <img src="/resource/img/profile_default.png" className="frontProfileImg"/>
                                </>
                            :
                                <>
                                    <img src={`http://localhost:3001/${myProfile[profileId].id}/${myProfile[profileId].frontImg}`} className="frontProfileImg"/>
                                </>
                            
                        }
                        <span className="profileName">{myProfile[profileId].name}</span>
                        {myProfile[profileId].curMsg}
                    </li>
                ))}
            </ul> 
        </>
    );
}

export default MyProfile;