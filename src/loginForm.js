import React from "react";
import axios from 'axios';


export default class LoginForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            error: ''
        };
        this.setFieldValue = this.setFieldValue.bind(this);
        this.submit = this.submit.bind(this);
    }
    setFieldValue(e) {
        this[e.target.name] = e.target.value
        // console.log(this);
    }
    submit(e) {
        axios.post('/login', {
            email: this.email,
            password: this.password
        }).then(({data})=> {
            if(data.error) {
                console.log(data.error);
                this.setState({
                    error: data.error
                });
            }
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
            <div className="login-form">
                {this.state.error && <div> {this.state.error} </div>} { /* here we have to handle the error through state!!! */ }
                <input name="email" placeholder="Email" onChange={e => this.setFieldValue(e)}/><br />
                <input type="password" name="password" placeholder="Password" onChange={e => this.setFieldValue(e)}/> <br />
                <button name="Submit" onClick={e => this.submit(e)}>Submit</button>
            </div>
        )
    }
}
