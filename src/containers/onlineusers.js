import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Route } from 'react-router-dom';

class OnlineUsers extends Component {
    constructor(props) {
        super(props);
    }

    renderOnlineUsersList() {
        console.log(this.props.onlineUsers); // this.props.onlineUsers we are getting from redux // even inside of the data is my data
        if(!this.props.onlineUsers) {
            return <div>No user currently logged in</div>
        }
        else {
            let currOnlineUsers = this.props.onlineUsers.filter(user => user.id != this.props.currUserId);
            if (currOnlineUsers.length == 0)
                return <div>No user currently logged in</div>
            else {
                return currOnlineUsers.map((user) => {
                    return (
                        <div className="grid-item" key={user.id}>
                            <p>{user.first_name} {user.last_name}</p>
                            <Route render={({history}) => (
                                <img
                                    onClick={() => { history.push(`/user/${user.id}`) }}
                                    className="friend-pic" src={user.profile_pic}
                                />
                            )}/>
                        </div>
                    )
                })
            }
        }
    }

    render() {
        return (
            <div className="list-container">
                <h1 className="grid-header"> These people are online: </h1>
                <div className="grid">{this.renderOnlineUsersList()}</div>
            </div>
        )
    }
}

function mapStateToProps(state) {
    console.log('mapStateToProps works and the state is', state)
    return {
        onlineUsers: state.onlineUsers
    }
}

export default connect(mapStateToProps)(OnlineUsers);
// connect define in redux react ! mapStateToProps : Redux and OnlineUsers(React)
// earlier we export the class but we need to export the class whatever it is connect with redux --> we go to appjs
// whenever I want to render an array as html code ,each of those items
// should have a unique key!
