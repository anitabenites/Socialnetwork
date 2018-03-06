export default function (state = null, action) {
    switch (action.type) { // action.type: index.js(actions): action creator
        case 'ONLINE_USERS': // I was connected .. I joined just so I should get the data of the people that are already there
            return action.payload;
        case 'USER_JOINED':
            return [ action.payload, ...state]; // state contain already an array of objects, actpaylo: object, "... = it will take allthe objects present in the state and it will take the action.payload and together will make a new array"
        case 'USER_LEFT':
            let newState = state.filter(item => item.id != action.payload); // inside the action.payload will we have the id of the person who left, in the state we we need to pass the id whose id is not = to payload
            return newState;
            // we are passing just the id to remove this object from their list of objects
    }
    return state;
}


// the code is inside of the server.
// whenever a new person joined create a new socket id fot his newly joined user.

// userjoined: old people will get the data of the new user that joined.


// let newState = state.filer(function(item) {
//     return item.id != action.payload
// })


//the state is an array of objects!!
