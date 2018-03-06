import React, { Component } from 'react';
import axios from 'axios';

export default class OtherProfile extends Component {
    constructor(props) {
        super(props);

        this.state = {
            //this.props.match.params is an inbuilt react functionality that allows us to access the id in the navigation url
            id: this.props.match.params.id,
            //details store the details of the user to which we redirect to
            details: {},
            //rel status stores the relationship this user has with the logged in user
            relStatus: ""
        }
    }

    //function to change the status of the relationship
    //there can be four actions that can be taken
    //1.send, 2.accept, 3.cancel, 4.unfriend
    //refer to app.post('/changeRelStatus') to see how we are using the action userid and isSender variables
    changeRelStatus(action) {
        axios.post('/changeRelStatus', {action : action, userid : this.state.id}).then(() => {
            //after the necessary changes are made we are using this route to get the new state of the relationship so that we
            //can render the view again i.e change the text appearing in the button and changing the action which happens on
            //clicking that button
            axios.post('/getRelStatus', {userid : this.state.id}).then((result) => {
                this.setState({relStatus : result.data.status, loggedInUserIsSender : result.data.isSender});
            })
        })
    }

    render() {
        return (
            <div className="profile-body">
                <div>
                    <div className="profile-details">
                        <div className="profile-details-header"><h1>Profile Details</h1></div>
                        <div className="profile-details-body">
                            <p className="profile-name">{this.state.details.first_name} {this.state.details.last_name}</p>
                            <p className="profile-email">-{this.state.details.email}</p>
                            <br/>
                            <p className="profile-bio">{this.state.details.bio}</p>
                        </div>
                    </div>
                </div>
                <div>
                    <div className="profile-pic">
                        {this.state.details.profile_pic && <img src={this.state.details.profile_pic} />}
                        {!this.state.details.profile_pic && <img src="images/default.jpg" />}
                        {/* depending on the status of relStatus we have four conditions during different phases of the frienship */}
                        {this.state.relStatus == "none" &&  <button className="crimson-btn" onClick={() => this.changeRelStatus("send")}>Send friend request</button>}
                        {this.state.relStatus == "accept" &&  <button className="crimson-btn" onClick={() => this.changeRelStatus("accept")}>Accept friend request</button>}
                        {this.state.relStatus == "pending" &&  <button className="crimson-btn" onClick={() => this.changeRelStatus("cancel")}>Delete friend request</button>}
                        {this.state.relStatus == "friends" &&  <button className="crimson-btn" onClick={() => this.changeRelStatus("unfriend")}>Unfriend</button>}
                    </div>
                </div>
            </div>
        )
    }

    componentDidMount() {
        console.log(this.state.id);
        //on the first load of the component we can get the profile details of the user
        axios.post('/profile', {id : this.state.id}).then(result => {
            if(result.data.redirect)
                //we sending the object redirect : true from server side in case we are redirecting to a link which refers to our own profile
                //in that case we redirect the user to our own profile
                location.replace('/');
            else {
                //set the state of details
                this.setState({details : result.data.details});
                //get the relationship details of this user with the logged in user
                axios.post('/getRelStatus', {userid : this.state.id}).then((result) => {
                    this.setState({relStatus : result.data.status, loggedInUserIsSender: result.data.isSender});
                    console.log(this.state);
                })
            }
        })

    }
}
