import React, { useEffect } from 'react'
import Signup from '../components/Signup/Signup.jsx';
import { useSelector } from 'react-redux';

const SignupPage = () => {
    const { isAuthenticated } = useSelector((state) => state.user);
    useEffect(() => {
        if (isAuthenticated) {
            window.location.href = "/";
        }
    }, []);

    return (
        <div>
            <Signup />
        </div>
    )
}

export default SignupPage