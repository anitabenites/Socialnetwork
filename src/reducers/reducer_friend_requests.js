export default function (state = null, action) {
    console.log(action);
    switch (action.type) {
        case 'FETCH_FRIEND_REQUESTS' :
            console.log(action.payload);
            return action.payload.data.friendRequests;
        case 'ACCEPT_REQUEST':
            console.log(action.payload);
            return action.payload.data.friendRequests;
    }
    return state;
}
