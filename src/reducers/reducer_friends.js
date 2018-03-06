export default function (state = null, action) {
    console.log(action);
    switch (action.type) {
        case 'FETCH_FRIENDS':// this is the action creator
            console.log(action.payload);
            return action.payload.data.friends; // for friends see: line 456 index.js
        case 'UNFRIEND':
            console.log(action.payload);
            return action.payload.data.friends;// this is the action by it self!
        case 'ACCEPT_REQUEST':
            console.log(action.payload);
            return action.payload.data.friends;
    }
    return state;
}
