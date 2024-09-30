import React, { useState } from 'react';
import { Login } from '../components/Login';
import { Navigation } from '../components/Navigation';
export const LoginPage = () => {
    return (
        <div>
            <Navigation />
            <h1>Login</h1>
            <Login />
        </div>
    );
}
