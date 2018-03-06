import { combineReducers } from 'redux';
import FriendsReducer from './reducer_friends';
import FriendRequestsReducer from './reducer_friend_requests';
import OnlineUsersReducer from './reducer_online_users';

const rootReducer = combineReducers({
    friends: FriendsReducer,
    friendRequests: FriendRequestsReducer,
    onlineUsers: OnlineUsersReducer
});

export default rootReducer;

// we need to pass this propertoes  friends/friendRequests etc to these files friends and onlineusers!
