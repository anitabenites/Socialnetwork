import React, { Component } from 'react';

export default class ProfilePicUpload extends Component {
    constructor(props) {
        super(props);

        //maintains the state of the uploaded file
        this.state = {
            file: ''
        }
    }

    render() {
        if(!this.props.show)
            return null;
        else {
            return(
                <div className="upload-form">
                    <div>
                        <p>Upload profile picture</p>
                        <input multiple type="file" onChange={event => this.onFileInputChange(event)} /><br />
                        {/* call the set profile pic function passed from the main app app.js as soon as the set button in pressed */}
                        <button className="crimson-btn" onClick={() => this.props.setProfilePic(this.state.file)}>Set</button>
                        <span className="close-popup" onClick={() =>this.props.closePopup()}>&times;</span>
                    </div>
                </div>
            );
        }
    }

    onFileInputChange(event) {
        //as soon as the input change is detected we set a new state with the new file data
        const filedata = new FormData();
        filedata.append('file', event.target.files[0]);
        this.setState({file: filedata});
    }

}
