import React, { Component } from 'react';
import {Switch, BrowserRouter, Route, Link } from "react-router-dom";
import Profile from './profile';
import ProfilePic from './profilepic';
import ProfilePicUpload from './profilepicupload';
import OtherProfile from './otherprofile';
import Friends from './containers/friends';
import OnlineUsers from './containers/onlineusers';
import axios from 'axios';


export default class App extends Component {
    constructor(props) {
        super(props);
        //state stores the details of the logged in user and data used for hiding/showing the uploader component
        this.state = {
            details : {},
            uploaderVisible : false
        }
    }

    logout() {
        //after logout reroute to the main page so you can login again
        axios.post('/logout').then((result) => {
            console.log(result.success);
            location.replace('/welcome#/register');
        })
    }

    setProfilePic(fd) {
        console.log("post profile pic");
        //send post request so that the profile pic is set
        axios.post('/profilepic', fd).then((data) => {
           // after the profile pic is set correctly we can query for the db for the new profile details
           // and updating the older ones
            axios.get('/profile').then(result => {
                //set new state and hide the uploader component as its job is now done
                this.setState({
                    details : result.data.details,
                    uploaderVisible: false
                });
            })
        })
    }

    editBio(bio) {
        console.log(bio);
        //send post request to update bio
        axios.post('/editbio', {bio : bio}).then((data) => {
            console.log("edit bio done", data);
            //after succesfully updating the bio we can query the db for the new profile details
            axios.get('/profile').then(result => {
                this.setState({details : result.data.details});
                console.log(this.state);
            })
        })
    }

    render() {
        //applying dynamic styling to the image avatar appearing on the navbar
        var divStyle = {
            backgroundImage: 'url(' + this.state.details.profile_pic + ')',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat'
        }

        return (
            <BrowserRouter>
        <div>
            {/* This part remains common in both user profile and other profile hence not included inside the browser router */}
            <div className="nav-header">
                <h1>Social Network</h1>
                <div className="links">
                    <Link to="/">Home</Link><span className="divider">|</span>
                    <Link to="/friends">Friends</Link><span className="divider">|</span>
                    <Link to="/online">Online</Link>
                </div>
                <button className="crimson-btn" onClick={() => this.logout()}>Log out</button>
                {this.state.details.profile_pic && <div style={divStyle} className="img-avatar"></div>}
                {!this.state.details.profile_pic && <img className="img-avatar" src={"images/default.jpg"}/>}
            </div>
            {/* using browser router for switching between user profile and other person's profile */}
                <Switch>
                    <Route
                        exact path="/"
                        render={() => {
                            return (
                                <div className="profile-body">
                                    {/* Profile component passed the editBio function and details for the user, both of them are used in profile.js */}
                                    <div><Profile editBio={(bio) => this.editBio(bio)} details={this.state.details}></Profile></div>
                                    {/* ProfilePic component used to show the profile picture of the user and passed the function to make the uploader visible */}
                                    <div>
                                        <ProfilePic url={this.state.details.profile_pic} setProfilePicUrl={() => this.setState({uploaderVisible : true})}></ProfilePic>
                                    </div>
                                </div>
                            )
                        }}
                    />
                    {/* id is accessed inside the other profile component id is referring to user/3 etc here 3 is the id and can be
                    accessed as a nav param */}
                    <Route path='/user/:id' component={OtherProfile} />
                    <Route path='/friends' component={Friends} />
                    <Route exact path='/online' render = {() => {
                        return (
                            <OnlineUsers currUserId = {this.state.details.id}/>// currUserId : coming from redux, the syntax changed because we need to pass sth from parent to child ( the id of the onlineuser(loggin))
                        )
                    }}
                    />
                </Switch>
            {/* ProfilePicUpload component is made visible inside the profilepic component it is passed the function for uploading a new profile picture */}
            <ProfilePicUpload closePopup = {() => this.setState({uploaderVisible : false})} setProfilePic = {(filedata) => this.setProfilePic(filedata)} show={this.state.uploaderVisible}></ProfilePicUpload>
        </div>
    </BrowserRouter>
    );
}

    componentDidMount() {
        //runs when the component first mounts to query the db for the details of the user and set the state
        axios.get('/profile').then(result => {
            this.setState({details : result.data.details});
            console.log(this.state.details);
        })
    }
}
