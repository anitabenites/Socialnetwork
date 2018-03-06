import React from 'react';

const ProfilePic = ({setProfilePicUrl, url}) => {
    // let imageDiv;
    //if url is not present show default picture else show the picture whose url is passed from the app.js
    // if(url)
    //     imageDiv = <img src={url}/>
    // else
    //     imageDiv = <img src="/images/default.jpg"/>
    return (
        <div className="profile-pic">
            <img src={url}/>
            <button onClick={setProfilePicUrl} className="crimson-btn">Change Picture</button>
        </div>
    );
};

export default ProfilePic;
