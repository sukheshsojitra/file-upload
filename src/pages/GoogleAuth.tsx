import React from 'react';
import { useGoogleLogin, TokenResponse } from '@react-oauth/google';
import { setGoogleToken } from '../reducers/authentication';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import { GoogleIcon } from '../component/CustomIcons';

const GoogleAuth: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    // Google login with the correct scope for Gmail
    const login = useGoogleLogin({
        onSuccess: async (tokenResponse: TokenResponse) => {
            dispatch(setGoogleToken({ googleToken: tokenResponse.access_token, }));
            navigate('/dashboard');
        },
        onError: (error) => console.error('Login failed:', error),
        scope: 'https://www.googleapis.com/auth/gmail.readonly',
        prompt: 'consent',
    });
    return (
        <Button
            fullWidth
            variant="outlined"
            onClick={() => login()}
            startIcon={<GoogleIcon />}
        >
            Sign in with Google
        </Button>
    );
};

export default GoogleAuth;
