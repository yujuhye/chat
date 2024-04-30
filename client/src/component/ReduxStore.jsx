import React from 'react';

import { legacy_createStore as createStore, applyMiddleware } from 'redux';
import { thunk } from 'redux-thunk';
import { Provider } from 'react-redux';
import { reducer } from './reducer/reducer';
import MainHome from './MainHome';

// const store = createStore(reducer);
const store = createStore(reducer, applyMiddleware(thunk));

const ReduxStore = () => {
    return (
        <Provider store={store}>
            <MainHome />
        </Provider>
    );
};

export default ReduxStore;