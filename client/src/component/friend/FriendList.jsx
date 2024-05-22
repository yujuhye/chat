import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { friendListsAction, myProfileAction, selectedFriendId } from "../action/friendList";
import Nav from "../../include/Nav";
import MyProfile from "./MyProfile";

import '../../css/profile.css'
import '../../css/common.css'
import { Link } from "react-router-dom";
import SideNav from "../../include/SideNav";
import FriendProfile from "./FriendProfile";
import useAxiosGetMember from "../../util/useAxiosGetMember";
import cookie from 'js-cookie';
import { IoSearchSharp } from "react-icons/io5";
import { escapeRegExp } from "lodash";
import SocketAlarm from "./SocketAlarm";

function FriendList() {

    const dispatch = useDispatch();
    const friends = useSelector(state => state['friend']['friends']);
    const selectedFriend = useSelector(state => state['friend']['selectedFriend']);
    const [searchId, setSearchId] = useState('');
    useAxiosGetMember();

    useEffect(() => {
        console.log('[FriendList] useEffect');

        axiosGetFriendList();
        
    }, [dispatch]);

     //친구찾기
     const searchMyFriendChangeHandler = (e) => {
        console.log('searchMyFriendChangeHandler()');

        if(e.target.name === 'searchMyFriendId') {
            setSearchId(e.target.value);
        }
    }

    //친구 프로필 클릭시
    const friendProfileClickHandler = (friendId) => {
        console.log('friendProfileClickHandler()');

        // dispatch(selectedFriendId(friendId));
        
        if (selectedFriend === friendId) {
            dispatch(selectedFriendId(null));
        } else {
            dispatch(selectedFriendId(friendId));
        }
    }

    //친구리스트 불러오기
    const axiosGetFriendList = () => {
        console.log('axiosGetFriendList');

        axios({
            url: 'http://localhost:3001/friend/friendList',
            method: 'get',
        })
        .then(response => {
            console.log('axiosGetFriendList success', response.data);

            const friendsObj = response.data.reduce((obj, friend) => {
                obj[friend.FRIEND_NO] = {
                    no: friend.FRIEND_NO,
                    name: friend.FRIEND_TARGET_NAME,
                    id: friend.FRIEND_TARGET_ID,
                    favorite: friend.FRIEND_FAVORITES,
                    frontImg: friend.USER_FRONT_IMG_NAME,
                    backImg: friend.USER_BACK_IMG_NAME,
                    curMsg: friend.USER_CUR_MSG,
                };
                return obj;
            }, {});

            dispatch(friendListsAction(friendsObj));

        })
        .catch(error => {
            console.log('axiosGetFriendList error');
            
        })
        .finally(data => {
            console.log('axiosGetFriendList complete');
            
        });
    }

    //즐겨찾기 친구 필터링
    const favoirtefriendLists = () => {
        console.log('render favoirtefriendLists()');

        const favoriteLists = Object.keys(friends).filter((friendId) => friends[friendId].favorite === 1).map((friendId, index) => (
            <div className={`friendList ${selectedFriend === friends[friendId].id ? "selected" : ""}`}>
            <li key={index} className="profile" onClick={() =>friendProfileClickHandler(friends[friendId].id)}>
                 {
                        friends[friendId].frontImg === ''
                        ?
                            <>
                                <img src="/resource/img/profile_default.png" className="frontProfileImg"/>
                            </>
                            :
                            <>
                                <img src={`http://localhost:3001/${friends[friendId].id}/${friends[friendId].frontImg}`} className="frontProfileImg"/>
                            </>
                            
                }
                <span className="profileName">{friends[friendId].name}</span>
                <span className="friendCurMsg">{friends[friendId].curMsg}</span>
            </li>
            </div>
        ));

        return <ul>{favoriteLists}</ul>
    }

    //초성 검색
    const con2syl = {
        'ㄱ': '가'.charCodeAt(0),
        'ㄲ': '까'.charCodeAt(0),
        'ㄴ': '나'.charCodeAt(0),
        'ㄷ': '다'.charCodeAt(0),
        'ㄸ': '따'.charCodeAt(0),
        'ㄹ': '라'.charCodeAt(0),
        'ㅁ': '마'.charCodeAt(0),
        'ㅂ': '바'.charCodeAt(0),
        'ㅃ': '빠'.charCodeAt(0),
        'ㅅ': '사'.charCodeAt(0),
      };
      const begin = con2syl[searchId] || ( ( searchId.charCodeAt(0) - 12613  ) * 588 + con2syl['ㅅ'] );
      const end = begin + 587;
      const pattern = `[${searchId}\\u${begin.toString(16)}-\\u${end.toString(16)}]`;

      function ch2pattern(searchId) {
        const offset = 44032; 
        // 한국어 음절
        if (/[가-힣]/.test(searchId)) {
          const chCode = searchId.charCodeAt(0) - offset;
          // 종성이 있으면 문자 그대로
          if (chCode % 28 > 0) {
            return searchId;
          }
          const begin = Math.floor(chCode / 28) * 28 + offset;
          const end = begin + 27;
          return `[\\u${begin.toString(16)}-\\u${end.toString(16)}]`;
        }
        // 한글 자음
        if (/[ㄱ-ㅎ]/.test(searchId)) {
          const con2syl = {
            'ㄱ': '가'.charCodeAt(0),
            'ㄲ': '까'.charCodeAt(0),
            'ㄴ': '나'.charCodeAt(0),
            'ㄷ': '다'.charCodeAt(0),
            'ㄸ': '따'.charCodeAt(0),
            'ㄹ': '라'.charCodeAt(0),
            'ㅁ': '마'.charCodeAt(0),
            'ㅂ': '바'.charCodeAt(0),
            'ㅃ': '빠'.charCodeAt(0),
            'ㅅ': '사'.charCodeAt(0),
          };
          const begin = con2syl[searchId] || ( ( searchId.charCodeAt(0) - 12613 /* 'ㅅ'의 코드 */ ) * 588 + con2syl['ㅅ'] );
          const end = begin + 587;
          return `[${searchId}\\u${begin.toString(16)}-\\u${end.toString(16)}]`;
        }
       
        return escapeRegExp(searchId);
      }

    function createFuzzyMatcher(input) {
        const pattern = input.split('').map(ch2pattern).join('.*?');
        return new RegExp(pattern, 'i');
      }

    const filteredFriends = Object.values(friends).filter(friend => {
        const regex = createFuzzyMatcher(searchId);
        return regex.test(friend.name);
    });

    const filteredFriendsObject = filteredFriends.reduce((friendobj, friend) => {
        friendobj[friend.no] = friend;
        return friendobj;
    }, {});


    return(
        <div className="friendListContainer">
        <SideNav />
        <div className="friendListWrap">
        {/* <Nav /> */}
        <div className="friendListWithAlarm">
            <h2 className="friendLisText">친구 목록</h2>
            <span className="reqAlarm"><SocketAlarm /></span>
        </div>
           <div className="searchBox">
                <IoSearchSharp className="searchIcon"/>
                <input className="searchMyFriend" type="text" name="searchMyFriendId" value={searchId} onChange={(e) => searchMyFriendChangeHandler(e)}  placeholder="친구이름 검색"/>
           </div>
           {
            searchId === '' &&
            <>
                <MyProfile />
                <h3>즐겨찾기</h3>
                <span>{favoirtefriendLists()}</span>
            </>
            }
           <h3>친구</h3>
            <ul>
                {Object.keys(filteredFriendsObject).map((friendId, index) => (
                    // <div className="friendList">
                    <div className={`friendList ${selectedFriend === friends[friendId].id ? "selected" : ""}`} >
                    <li key={index} className="profile" onClick={() =>friendProfileClickHandler(friends[friendId].id)}>
                        
                        {
                            friends[friendId].frontImg === ''
                            ?
                                <>
                                    <img src="/resource/img/profile_default.png" className="frontProfileImg"/>
                                </>
                            :
                                <>
                                    <img src={`http://localhost:3001/${friends[friendId].id}/${friends[friendId].frontImg}`} className="frontProfileImg"/>
                                </>
                            
                        }
                        <span className="profileName">{friends[friendId].name}</span>
                        <span className="friendCurMsg">{friends[friendId].curMsg}</span>
                    </li>
                    </div>
                    // </div>
                ))}
            </ul>
            </div>
            <div className="friendProfileDetailsWrap">
            {
                selectedFriend === null 
                ?
                <></>
                :
                <>
                <FriendProfile />
                </>
            }
            </div>
         </div>
    );
}

export default FriendList;