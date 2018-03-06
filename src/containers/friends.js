import React, { Component } from 'react'; //react is dealing with the view/frontEnd part
import { connect } from 'react-redux'; // react-redux --> just connect react and redux!
import { bindActionCreators } from 'redux';
import { fetchFriends, fetchFriendRequests, unfriend, accept } from '../actions/index'; // .. is to get to the root folder: src
//meaning of fetch: you are requisting information from somewhere.
import { Route } from 'react-router-dom';
import OtherProfile from '../otherprofile';

class Friends extends Component { // this line of code is react!!
    constructor(props) {
        super(props);
    }

    renderFriends() {
        if(this.props.friends) { // these are arrays that are contained in my database!
            return this.props.friends.map((friend) => { // the map function is taking each item of my array and converting it into html,
                // the array will have an object( first, last, id, profilpic)
                return (
                    <div className="grid-item" key={friend.id}>
                        <p>{friend.first_name} {friend.last_name}</p>
                        <Route render={({history}) => (
                            <img
                                onClick={() => { history.push(`/user/${friend.id}`) }}
                                className="friend-pic" src={friend.profile_pic}
                            />
                    )}/>
                    <br />
                        <button className="action-btn" onClick={() => this.props.unfriend(friend.id)}>Unfriend</button>

                    </div>
                )
            })
        }
    }

    renderFriendRequests() {
        if(this.props.friendRequests) {
            return this.props.friendRequests.map((friendRequest) => {
                return (
                    <div className="grid-item" key={friendRequest.id}>
                    <p>{friendRequest.first_name} {friendRequest.last_name}</p>
                    <Route render={({history}) => (
                        <img
                            onClick={() => { history.push(`/user/${friendRequest.id}`) }}
                            className="friend-pic" src={friendRequest.profile_pic}
                        />
                    )}/>
                    <br />
                    <button className="action-btn" onClick={() => this.props.accept(friendRequest.id)}>Accept Request</button>
                </div>
            )
        })
    }
}

    render() {
        return (
            <div className="list-container">
                <h1 className="grid-header">These people want to be your friends: </h1>
                <div className="friend-request-list grid">{this.renderFriendRequests()}</div>
                <h1 className="grid-header">These people are your friends: </h1>
                <div className="friend-list grid">{this.renderFriends()}</div>
            </div>

        )
    }

    componentDidMount() {
        this.props.fetchFriends();
        this.props.fetchFriendRequests(); //when your component loads(when u friends load this friend page, you want to show the users the "pending friends requests and friends")
        // we are calling the database through these function.. and these are defined in the actions folder.
    }
}
// dispatch: send something.MDTP: A function define by redux
// you are mapping something(refers to an action) to the properties.
function mapDispatchToProps(dispatch) { // it is connecting this file(friend.js) with this 4 funvtions that are described inside of the actions folder!
    //we are binding this 4 functions to these variables.
    return bindActionCreators({ fetchFriends: fetchFriends, // we are using in line 58
                                fetchFriendRequests: fetchFriendRequests,
                                unfriend: unfriend,
                                accept: accept //(property/value)
    }, dispatch); //you need to return the mapping and the dispatch!! (inbuilt in redux)
}

function mapStateToProps(state) { //is mapping the state that has been define inside the reducers (index.js)
    return {
        friends: state.friends, // I am mapping the "state.friends" in redux inside of the key friends!
        friendRequests: state.friendRequests
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Friends);
// when we are not using redux, we used to export the class at the mapStateToProps//
// this time we want to connect the component with the redux site and export that connection!
// when you do connect( ) () --> we need to connect react(friends) and redux(mapstat,mapdisp)
