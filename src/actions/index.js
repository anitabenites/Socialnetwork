import axios from 'axios';
// it helps us to make the connection with the server site.
// actions are functions that returns objects
// and the objects have a type and payload:

// these objets are passed to the REDUCERS!! AND BEFORE THAT THEY pass Trought THE middleware: (m: are something
//u use to manipulate the objects!!in our case the middleware that we are using is redux promise
// to see the middleware go to start.js)


// in the fetchFriends and fetchFriendRequests we just need the id of the loggin user
//and that is already present in the cookie session of the logginuser:
export function fetchFriends() { // these are actions creators!!
    const request = axios.get('/getfriends');
    console.log(request);
    return {
        type: 'FETCH_FRIENDS',
        payload: request
        // request is a string: axios.get for this moment, before this objects go to the reducers, the middler intersept it and it will check the payload, it will check that this contains an axios request (https)
        // that should execute, so it will execute that line of code and will go that data from the server and will put the data in the payload
        // when the middleware intersept the qury, it will ask the server for a information related to this route (axios.get.../)
    }
}

export function fetchFriendRequests() {
    const request = axios.get('/getfriendrequests');
    console.log(request);
    return {
        type: 'FETCH_FRIEND_REQUESTS',
        payload: request
    }
}

export function unfriend(id) {
    const request = axios.post('/unfriend', {userid: id}) // friends.js line 24 for the id inside of the button
    // we are sending the id of the friend we want to unfriend.
    return {
        type: 'UNFRIEND',
        payload: request // THE PAYLOAD JUST CONTAIN THE REQUEST,
    }
}

export function accept(id) {
    const request = axios.post('/acceptRequest', {userid: id})
    return {
        type: 'ACCEPT_REQUEST',
        payload: request
    }
}

//*************** socket.io part *******************//
export function onlineUsers(data) {
    return {
        type: 'ONLINE_USERS',
        payload: data
    }
}

export function userJoined(data) {
    return {
        type: 'USER_JOINED',
        payload: data
    }
}

export function userLeft(data) {
    return {
        type: 'USER_LEFT',
        payload: data
    }
}
//******************** Chatmessages *********************//
//
// export function sendMessage(Message) {
//     console.log('running action sendmessage')
// }

// export function chatMessages() {
//     const request = axios.get()
// }
