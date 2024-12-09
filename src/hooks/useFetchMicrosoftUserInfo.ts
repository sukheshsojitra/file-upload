import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUser } from '../reducers/authentication';

export const useFetchMicrosoftUserInfo = (microsoftToken: string | null) => {
    const dispatch = useDispatch();

    const fetchMicrosoftUserInfo = useCallback(async () => {
        try {
            const response = await fetch('https://graph.microsoft.com/v1.0/me', {
                headers: {
                    Authorization: `Bearer ${microsoftToken}`,
                },
            });
            if (!response.ok) {
                throw new Error('Failed to fetch user info');
            }
            const data = await response.json();
            const imageResponse = await fetch('https://graph.microsoft.com/v1.0/me/photo/$value', {
                headers: {
                    Authorization: `Bearer ${microsoftToken}`,
                },
            });
            if (!imageResponse.ok) {
                throw new Error('Failed to fetch user image');
            }
            const imageBlob = await imageResponse.blob();
            const imageUrl = URL.createObjectURL(imageBlob);
            dispatch(setUser({
                name: data.displayName,
                email: data.mail,
                picture: imageUrl,
            }));
        } catch (error) {
            console.error('Error fetching Microsoft user info:', error);
        }
    }, [dispatch, microsoftToken]);

    useEffect(() => {
        if (microsoftToken) {
            fetchMicrosoftUserInfo();
        }
    }, [microsoftToken, fetchMicrosoftUserInfo]);
};
