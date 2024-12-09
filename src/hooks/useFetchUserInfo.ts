import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { jwtDecode, JwtPayload } from "jwt-decode";
import { setUser } from '../reducers/authentication';

interface CustomJwtPayload extends JwtPayload {
    unique_name?: string;
}

export const useFetchUserInfo = (token: string | null) => {
    const dispatch = useDispatch();

    const fetchUserInfo = useCallback(() => {
        try {
            if (token) {
                const decoded = jwtDecode<CustomJwtPayload>(token);
                if (decoded?.unique_name) {
                    dispatch(setUser({
                        name: decoded.unique_name,
                    }));
                }
            }
        } catch (error) {
            console.error('Error decoding token:', error);
        }
    }, [dispatch, token]);

    useEffect(() => {
        if (token) {
            fetchUserInfo();
        }
    }, [fetchUserInfo, token]);
};
