import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import {Link} from 'react-router-dom';


export default class RegisterForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        };
        this.setFieldValue = this.setFieldValue.bind(this);
        this.submit = this.submit.bind(this);
    }
    setFieldValue(e) {
        this[e.target.name] = e.target.value
        // console.log(this);
    }
    submit(e) {
        axios.post('/register', {
            firstname: this.firstname,
            lastname: this.lastname,
            password: this.password,
            email: this.email
        }).then(({data})=> {
            console.log("check data", data);
            if (data.success) {
                location.replace('/');
            } else if(data.incompletePassword){
                console.log("incompleted password");
                this.setState ({
                    error: 'Enter a password',
                })
            } else if (data.incompleteInformation){
                console.log("incompleted Information");
                this.setState ({
                    error: 'Enter all the fields.'
                })
            }
        });
        // .catch(() => {
        //     console.log('Failed!!')
        // })
    }
    render() {
        return (
            <div className="register-form">
                {this.state.error && <div> FAILURE </div>} { /* here we have to handle the error through state!!! */ }
                <input name="firstname" placeholder="First Name" onChange={e => this.setFieldValue(e)}/>
                <input name="lastname" placeholder="Last Name" onChange={e => this.setFieldValue(e)}/> <br />
                <input name="email" placeholder="Email" onChange={e => this.setFieldValue(e)}/>
                <input type="password" name="password" placeholder="Password" onChange={e => this.setFieldValue(e)}/> <br />
                <button name="Submit" onClick={e => this.submit(e)}>Submit</button>
            </div>
        )
    }
}
