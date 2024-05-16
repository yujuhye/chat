import React, { useState, useEffect, useCallback } from 'react';
import Nav from '../../../include/Nav';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { setNewsListAction, setSelectedNewsContentAction } from '../../../component/action/newsActions';
import useAxiosGetAdmin from '../../../util/useAxiosGetAdmin';

const NewsList = () => {

    const newsList = useSelector(state => state.news.newsList);
    const [expandedNews, setExpandedNews] = useState(new Array(newsList.length).fill(false));
    const selectedNewsContent = useSelector(state => state.news.selectedNewsContent);
    const [isFetchingNewsContent, setIsFetchingNewsContent] = useState(false);

    const dispatch = useDispatch();

    useAxiosGetAdmin();

    useEffect(() => {
        AxiosGetNews();
    }, []);

    const AxiosGetNews = async () => {
        console.log('[NewsList] AxiosGetNews()');
        try {
            const response = await axios.get(
                'http://localhost:3001/admin/getNews',
                { withCredentials: true }
            );

            console.log('[NewsList] AXIOS GET NEWS COMMUNICATION SUCCESS');

            if (response.data && response.data.newsList) {
                console.log('[NewsList] response.data.newsList ----> ', response.data.newsList);
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
        console.log('[NewsList] AxiosGetNewsContent()');
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
            }

        } catch (error) {
            console.error('Error fetching news content:', error);
        } finally {
            setIsFetchingNewsContent(false);
        }
    };

    return (
        <div>
            <Nav />
            <h1>공지사항</h1>
            <table>
                <thead>
                    <tr>
                        <th>공지</th>
                        <th>날짜</th>
                    </tr>
                </thead>
                <tbody>
                    {newsList.map((news, index) => (
                        <React.Fragment key={news.id || index}>
                            <tr onClick={() => showNewsContent(index)}>
                                <td>{news.NEWS_TITLE}</td>
                                <td>{news.NEWS_REG_DATE.slice(0, 10)}</td>
                            </tr>
                            {expandedNews[index] && (
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
            <div>
                <Link to="/admin/newsform">글쓰기</Link>
            </div>
        </div>
    );

};


export default NewsList;