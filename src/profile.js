import React, { Component } from 'react';

export default class Profile extends Component {
    constructor(props) {
        super(props);

        console.log(props.details);

        this.state = {
            newBio : "",
            addBio : false
        }
    }

    //we are using a controlled form using the this.state.newBio
    //everytime the input is changed we change the state
    onInputChange(bio) {
        this.setState({ newBio : bio});
    }

    //for showing the form for writing a new bio
    showBioForm() {
        this.setState({
            newBio: this.props.details.bio,
            addBio : true
        });
    }

    //for saving the bio form and hiding it after the editBio function has been called
    saveBioForm() {
        this.props.editBio(this.state.newBio);
        this.setState({addBio: false});
    }

    render() {
        console.log('rendered again');
        //variables being used to hide and show the various divs
        //displayNone class in style.css helps us hide and show the various divs
        let [ classAddBio, classEditBio, classBioForm ] = Array(3).fill("displayNone");

        //if addBio is true that means we need to show the bio form and hide the rest
        if(this.state.addBio)
            classBioForm = "";
        else {
            //otherwise check if bio is set or not
            //if bio not available previously we show the addBio div
            if(!this.props.details.bio)
                classAddBio = "";
            //if bio previously present we show the editBio div
            else
                classEditBio = "";
        }

        return (
            <div className="profile-details">
                <div className="profile-details-header"><h1>Profile Details</h1></div>
                <div className="profile-details-body">
                    <p className="profile-name">{this.props.details.first_name} {this.props.details.last_name}</p>
                    <p className="profile-email">-{this.props.details.email}</p>
                </div>
                <div className="profile-bio-div">
                    <div className={classAddBio}>
                        <p className="profile-bio">Nothing in bio yet</p>
                        <button className="crimson-btn" onClick={() => this.showBioForm()}>Add Bio</button>
                    </div>
                    <div className={classEditBio}>
                        <p className="profile-bio">{this.props.details.bio}</p>
                        <button className="crimson-btn" onClick={() => this.showBioForm()}>Edit Bio</button>
                    </div>
                    <div className={classBioForm}>
                        <input value={this.state.newBio} onChange={event => this.onInputChange(event.target.value)}/><br />
                        <button className="crimson-btn" onClick={() => this.saveBioForm()}>Save</button>
                    </div>
                </div>
            </div>
        )

    }
}
