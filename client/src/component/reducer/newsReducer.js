import { SET_NEWS_TITLE, SET_NEWS_CONTENT, SET_NEWS_LIST, SET_SELECTED_NEWS_CONTENT } from '../action/types';

const initialState = {
    newsTitle: '',
    newsContent: '',
    newsList: [],
    selectedNewsContent: {}
};

const newsReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_NEWS_TITLE:
            return {
                ...state,
                newsTitle: action.payload
            };
        case SET_NEWS_CONTENT:
            return {
                ...state,
                newsContent: action.payload
            };

        case SET_NEWS_LIST:
            return {
                ...state,
                newsList: action.payload
            };

        case SET_SELECTED_NEWS_CONTENT:
            return {
                ...state,
                selectedNewsContent: action.payload
            };

        default:
            return state;
    }
};

export default newsReducer;