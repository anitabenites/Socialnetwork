import React from "react";
import RegisterForm from "./registerForm";
import { HashRouter, Route, Link } from 'react-router-dom';
import LoginForm from './loginForm';

export default function Welcome(props) {
    return (
        <div className="welcome-page">
            <div className="header-info">
                <h1>Welcome</h1>
                <div className="welcome-content">
                    <p>Our Social Network connects you with people that share the same interests like you.</p>
                    <HashRouter>
                        <div>
                            <Link to="/login"><button>Login</button></Link>
                            <Link to="/register"><button>Register</button></Link>
                            <Route exact path="/register" component = {RegisterForm}/>
                            <Route path="/login" component={LoginForm} />
                        </div>
                    </HashRouter>
                    <img src="images/people-collage.jpg"/>
                </div>
            </div>
        </div>
    );
}
