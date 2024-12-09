import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUser } from '../reducers/authentication';

export const useFetchGoogleUserInfo = (googleToken: string | null) => {
    const dispatch = useDispatch();

    const fetchGoogleUserInfo = useCallback(async () => {
        try {
            const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: {
                    Authorization: `Bearer ${googleToken}`,
                },
            });
            if (!response.ok) {
                throw new Error('Failed to fetch user info');
            }
            const data = await response.json();
            dispatch(setUser({
                name: data.name,
                email: data.email,
                picture: data.picture,
                sub: data.sub,
                exp: Math.floor(Date.now() / 1000) + data.expires_in,
            }));
        } catch (error) {
            console.error('Error fetching Google user info:', error);
        }
    }, [dispatch, googleToken]);

    useEffect(() => {
        if (googleToken) {
            fetchGoogleUserInfo();
        }
    }, [googleToken, fetchGoogleUserInfo]);
};
