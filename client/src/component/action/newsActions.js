import { SET_NEWS_TITLE, SET_NEWS_CONTENT, SET_NEWS_LIST, SET_SELECTED_NEWS_CONTENT } from './types';

export const setNewsTitleAction = (newsTitle) => ({
    type: SET_NEWS_TITLE,
    payload: newsTitle
});

export const setNewsContentAction = (newsContent) => ({
    type: SET_NEWS_CONTENT,
    payload: newsContent
});

export const setNewsListAction = (newsList) => ({
    type: SET_NEWS_LIST,
    payload: newsList
});

export const setSelectedNewsContentAction = (selectedNewsContent) => {
    console.log('selectedNewsContent:', selectedNewsContent);
    const action = {
        type: SET_SELECTED_NEWS_CONTENT,
        payload: selectedNewsContent

    };
    console.log('dispatching action:', action);
    return action;
};



