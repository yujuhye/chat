import React, { useState, useEffect } from 'react';
import Nav from '../../../include/Nav';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { setNewsTitleAction, setNewsContentAction } from '../../../component/action/newsActions';
import useAxiosGetAdmin from '../../../util/useAxiosGetAdmin';
import cookie from 'js-cookie';
import { useNavigate } from 'react-router-dom';

const NewsForm = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [newsTitle, setNewsTitle] = useState('');
    const [newsContent, setNewsContent] = useState('');

    useAxiosGetAdmin();

    const newsInfoChangeHandler = (e) => {
        console.log('[NewsForm] writeNewsSubmitBtnClickHandler()');

        let input_name = e.target.name;
        let input_value = e.target.value;
        if (input_name === 'newsTitle') {
            setNewsTitle(input_value);
            dispatch(setNewsTitleAction(input_value));

        } else if (input_name === 'newsContent') {
            setNewsContent(input_value);
            dispatch(setNewsContentAction(input_value));
            console.log('input_value ---> ', setNewsContentAction(input_value));
        }
    }

    const writeNewsSubmitBtnClickHandler = (e) => {
        console.log('[NewsForm] writeNewsSubmitBtnClickHandler()');

        let form = document.newsForm;

        if (newsTitle === '') {
            alert('제목을 입력하세요!');
            form.newsTitle.focus();

        } else if (newsContent === '') {
            alert('내용을 입력하세요!');
            form.newsContent.focus();

        } else {
            axiosNews();
        }
    }

    const axiosNews = () => {

        const adminToken = cookie.get('adminToken');
        console.log('[NewsForm] adminToken ---> ', adminToken);

        const requestData = {
            newsTitle: newsTitle,
            newsContent: newsContent,
            adminToken: adminToken,
        };

        axios({
            url: `http://localhost:3001/admin/newsWriteConfirm?`,
            method: 'post',
            data: requestData,
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
        })

            .then(response => {

                console.log('[NewsForm] AXIOS NEWS WRITE COMMUNICATION SUCCESS');
                console.log('[NewsForm] response.data', response.data);

                if (response.data > 0) {
                    alert('NEWS WRITE PROCESS SUCCESS!!');
                    window.location.href = '/admin/news';

                } else {
                    alert('NEWS WRITE PROCESS FAIL!!');
                    setNewsTitle('');
                    setNewsContent('');
                    dispatch(setNewsTitleAction(''));
                    dispatch(setNewsContentAction(''));
                }

            })
            .catch(error => {

                console.log('[NewsForm] AXIOS NEWS WRITE COMMUNICATION ERROR');
                if (error.response && error.response.data && error.response.data.error) {
                    alert(error.response.data.error);
                    navigate('/admin/adminlogin');

                } else {
                    console.error('Unknown error occurred:', error);
                }
            })

            .finally(data => {
                console.log('[NewsForm] AXIOS NEWS WRITE COMMUNICATION FINALLY');

            });

    }

    const writeNewsResetBtnClickHandler = (e) => {
        console.log('[NewsForm] writeNewsSubmitBtnClickHandler()');

        setNewsTitle('');
        setNewsContent('');
        dispatch(setNewsTitleAction(''));
        dispatch(setNewsContentAction(''));
    }

    return (
        <div>
            <Nav />
            <p>공지사항 글쓰기</p>
            <form name="newsForm">
                <input type="text" name="newsTitle" value={newsTitle} onChange={(e) => newsInfoChangeHandler(e)} placeholder="제목을 입력하세요." /><br />
                <textarea name="newsContent" value={newsContent} onChange={(e) => newsInfoChangeHandler(e)} placeholder="내용을 입력하세요." /><br />
                <input type="button" value="WRITE" onClick={writeNewsSubmitBtnClickHandler} />
                <input type="reset" value="RESET" onClick={writeNewsResetBtnClickHandler} />
            </form>
        </div >
    );
};

export default NewsForm;