import * as io from 'socket.io-client'
import { dispatch } from 'redux'
import {onlineUsers,userJoined, userLeft} from './actions/index';

let socket;

export function getSocket(store) {
    if(!socket) {
        socket = io.connect();
    }

    socket.on('onlineUsers', (data) => {
        store.dispatch(onlineUsers(data.onlineUsers))
    })

    socket.on('userJoined', (data) => {
        store.dispatch(userJoined(data.newUser))
    })

    socket.on('userLeft', (data) => {
        store.dispatch(userLeft(data.leftUser))
    })
}
