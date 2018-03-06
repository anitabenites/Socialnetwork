import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import reduxPromise from 'redux-promise'; // that is the middleware
import reducers from './reducers';
import { getSocket } from './socket';
import Welcome from './welcome';
import App from './app';
import { composeWithDevTools } from 'redux-devtools-extension';

export const store = createStore(reducers, composeWithDevTools(applyMiddleware(reduxPromise)));



let component;

if(location.pathname == '/welcome') {
    console.log('about to load welcome')
    component = <Welcome />;
} else {
    getSocket(store);
    console.log('About to load App')
    component = <Provider store ={store}><App /></Provider>;
}

ReactDOM.render(component, document.querySelector('main'))
