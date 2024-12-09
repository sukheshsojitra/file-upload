import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import UserProfile from './UserProfile';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/images/logo.svg'

interface HeaderProps {
    onFileUploadClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onFileUploadClick = () => { } }) => {
    const navigate = useNavigate();
    return (
        <AppBar position="static">
            <Container maxWidth={false}>
                <Toolbar disableGutters>
                    <img src={logo} alt="Catex" width={110} height={17} />
                    <Box flexGrow={1} display="flex" ml={1}>
                        <Button sx={{ my: 2, color: 'white', display: 'block' }} onClick={() => { onFileUploadClick(); navigate(`/file-upload`) }}>
                            File Upload
                        </Button>
                    </Box>
                    <UserProfile />
                </Toolbar>
            </Container>
        </AppBar>
    );
}
export default Header;