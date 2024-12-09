import { useMsal } from '@azure/msal-react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setMicrosoftToken } from '../reducers/authentication';
import { Button } from '@mui/material';
import { MicrosoftIcon } from '../component/CustomIcons';

const MicrosoftAuth = () => {
    const { instance } = useMsal();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const handleLogin = () => {
        instance.loginPopup({ scopes: ["Mail.Read"] }).then((response) => {
            dispatch(setMicrosoftToken({ microsoftToken: response.accessToken, }));
            navigate('/file-upload');
        }).catch(e => console.error(e));
    };

    return (
        <Button
            fullWidth
            variant="outlined"
            onClick={handleLogin}
            startIcon={<MicrosoftIcon />}
        >
            Sign in with Microsoft
        </Button>
    );
};

export default MicrosoftAuth;
