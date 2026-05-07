import React, { useEffect } from 'react'
import Login from '../components/Login/Login.jsx';
import { useSelector } from 'react-redux';

const LoginPage = () => {
    const { isAuthenticated } = useSelector((state) => state.user);
    useEffect(() => {
        if (isAuthenticated) {
            window.location.href = "/";
        }
    }, []);
    
    return (
        <div>
            <Login />
        </div>
    )
}

export default LoginPage;