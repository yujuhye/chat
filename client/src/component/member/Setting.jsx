import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { setIsLoginAction, setUserIdAction } from '../action/loginActions';
import { setNewsListAction, setSelectedNewsContentAction } from '../action/newsActions';
import Nav from '../../include/Nav';
import { Link, useNavigate } from 'react-router-dom';
import cookie from 'js-cookie';
import useAxiosGetMember from '../../util/useAxiosGetMember';
import '../../css/member/setting.css';

const Setting = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const newsList = useSelector(state => state.news.newsList);
    const [expandedNews, setExpandedNews] = useState(new Array(newsList.length).fill(false));
    const selectedNewsContent = useSelector(state => state.news.selectedNewsContent);
    const [isFetchingNewsContent, setIsFetchingNewsContent] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const newsPerPage = 5;

    useAxiosGetMember();

    useEffect(() => {
        AxiosGetNews();
    }, []);

    const AxiosGetNews = async () => {
        console.log('[Setting] AxiosGetNews()');
        try {
            const response = await axios.get(
                'http://localhost:3001/admin/getNews',
                { withCredentials: true }
            );

            console.log('[Setting] AXIOS GET NEWS COMMUNICATION SUCCESS');

            if (response.data && response.data.newsList) {
                console.log('[Setting] response.data.newsList ----> ', response.data.newsList);
                dispatch(setNewsListAction(response.data.newsList));
                setExpandedNews(new Array(response.data.newsList.length).fill(false));
            }

        } catch (error) {
            console.error('Error fetching news:', error);
        }
    };

    const showNewsContent = useCallback((index) => {
        setExpandedNews(prevState => {
            const newState = [...prevState];

            if (newState[index]) {
                newState[index] = false;
            } else {
                for (let i = 0; i < newState.length; i++) {
                    newState[i] = false;
                }
                newState[index] = true;
                AxiosGetNewsContent(index);
            }
            return newState;
        });
    }, []);

    const AxiosGetNewsContent = async (index) => {
        console.log('[Setting] AxiosGetNewsContent()');
        if (isFetchingNewsContent) {
            return;
        }

        setIsFetchingNewsContent(true);
        try {
            const response = await axios.get(
                'http://localhost:3001/admin/getNewsContent',
                {
                    params: { index },
                    withCredentials: true
                }
            );

            console.log('AXIOS GET NEWS CONTENT COMMUNICATION SUCCESS');
            console.log('response.data: ', response.data);

            if (response.data && response.data.newsContent) {
                console.log('response.data.newsContent: ', response.data.newsContent);
                const selectedNewsContent = response.data.newsContent[0];
                dispatch(setSelectedNewsContentAction(selectedNewsContent));
                console.log('setSelectedNewsContentAction: ', dispatch(setSelectedNewsContentAction(selectedNewsContent)));
            }

        } catch (error) {
            console.error('Error fetching news content:', error);
        } finally {
            setIsFetchingNewsContent(false);
        }
    };

    const logoutClickHandler = () => {
        console.log('logoutClickHandler()');
        axiosMemberLogout();
    }

    const memberDeleteClickHandler = () => {
        console.log('deleteClickHandler()');
        axiosMemberDelete();
    }

    const axiosMemberLogout = () => {
        console.log('axiosMemberLogout()');

        const userToken = cookie.get('userToken');

        axios({
            url: 'http://localhost:3001/member/logoutConfirm',
            method: 'put',
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        })
            .then(response => {
                console.log('AXIOS MEMBER LOGOUT COMMUNICATION SUCCESS', response.data);
                dispatch(setIsLoginAction(false));
                dispatch(setUserIdAction(''));
                cookie.remove("userToken");
                navigate('/');
            })
            .catch(error => {
                console.log('AXIOS MEMBER LOGOUT COMMUNICATION ERROR');
                if (error.response && error.response.data && error.response.data.error) {
                    navigate('/member/login');
                } else {
                    console.error('Unknown error occurred:', error);
                }
            })
            .finally(data => {
                console.log('AXIOS MEMBER LOGOUT COMMUNICATION COMPLETE');
            });
    }

    const userId = useSelector(state => state.login.userId);

    const axiosMemberDelete = () => {
        console.log('axiosMemberDelete()');

        if (!window.confirm('정말 탈퇴하시겠습니까?')) return;

        const userToken = cookie.get('userToken');

        axios({
            url: 'http://localhost:3001/member/memberDeleteConfirm',
            method: 'delete',
            data: {
                userId: userId,
            },
            headers: {
                Authorization: `Bearer ${userToken}`
            },
            withCredentials: true,
        })
            .then(response => {
                console.log('AXIOS MEMBER DELETE COMMUNICATION SUCCESS', response.data);

                if (Number(response.data) === 0) {
                    alert('MEMBER DELETE FAIL!!');
                    dispatch(setIsLoginAction(false));
                    dispatch(setUserIdAction(''));
                    cookie.remove("userToken");
                } else {
                    alert('MEMBER DELETE SUCCESS!!');
                    dispatch(setIsLoginAction(false));
                    dispatch(setUserIdAction(''));
                    cookie.remove("userToken");
                    navigate('/');
                }
            })
            .catch(error => {
                console.log('AXIOS MEMBER DELETE COMMUNICATION ERROR');
                if (error.response && error.response.data && error.response.data.error) {
                    navigate('/member/login');
                } else {
                    console.error('Unknown error occurred:', error);
                }
            })
            .finally(data => {
                console.log('AXIOS MEMBER DELETE COMMUNICATION COMPLETE');
            });
    }

    // Pagination logic
    const indexOfLastNews = currentPage * newsPerPage;
    const indexOfFirstNews = indexOfLastNews - newsPerPage;
    const currentNews = newsList.slice(indexOfFirstNews, indexOfLastNews);
    const totalPages = Math.ceil(newsList.length / newsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div>
            <Nav />
            <div className="settingContainer">
                <h1 className="settingHeader">공지사항</h1>
                <div className="settingContent">
                    <table className="settingTable">
                        <thead>
                            <tr>
                                <th className="titleColumn">공지</th>
                                <th className="dateColumn">날짜</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentNews.map((news, index) => (
                                <React.Fragment key={news.id || index}>
                                    <tr onClick={() => showNewsContent(indexOfFirstNews + index)}>
                                        <td>{news.NEWS_TITLE}</td>
                                        <td className="dateColumn">{news.NEWS_REG_DATE.slice(0, 10)}</td>
                                    </tr>
                                    {expandedNews[indexOfFirstNews + index] && (
                                        <tr>
                                            <td colSpan="2">
                                                {typeof selectedNewsContent === 'string' ? selectedNewsContent :
                                                    selectedNewsContent && selectedNewsContent.NEWS_CONTENT ? selectedNewsContent.NEWS_CONTENT : 'No content available'}
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                    <div className="pagination">
                        {[...Array(totalPages)].map((_, i) => (
                            <button key={i} onClick={() => paginate(i + 1)} className={`pageButton ${i + 1 === currentPage ? 'active' : ''}`}>
                                {i + 1}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="settingLinks">
                    <Link onClick={logoutClickHandler}>로그아웃</Link> &nbsp;
                    <Link to="/member/modify">회원 정보 수정</Link>
                    <Link onClick={memberDeleteClickHandler}>회원 탈퇴</Link>
                </div>
            </div>
        </div>
    );
};



export default Setting;