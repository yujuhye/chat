import React from 'react';

import { legacy_createStore as createStore } from 'redux';
import { Provider } from 'react-redux';
import { reducer } from './reducer/reducer';
import MainHome from './MainHome';

const store = createStore(reducer);

const ReduxStore = () => {
    return (
        <Provider store={store}>
            <MainHome />
        </Provider>
    );
};

export default ReduxStore;