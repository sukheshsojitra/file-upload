import React from 'react';
import { Avatar, Box, IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../config/store';
import { logOut } from '../reducers/authentication';
import { useFetchUserInfo } from '../hooks/useFetchUserInfo';

const UserProfile = () => {
    const dispatch = useDispatch();
    const { token, userInfo } = useSelector((state: RootState) => state.auth);
    useFetchUserInfo(token);

    const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };
    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };
    return (
        <>
            {userInfo &&
                <Box sx={{ flexGrow: 0 }}>
                    <Tooltip title="Open settings">
                        <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                            <Avatar alt={userInfo.name} src={userInfo.picture} />
                        </IconButton>
                    </Tooltip>
                    <Menu
                        sx={{ mt: '45px' }}
                        id="menu-appbar"
                        anchorEl={anchorElUser}
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        keepMounted
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        open={Boolean(anchorElUser)}
                        onClose={handleCloseUserMenu}
                    >
                        <MenuItem onClick={handleCloseUserMenu}>Name: {userInfo.name}</MenuItem>
                        {userInfo.email && <MenuItem onClick={handleCloseUserMenu}>Email: {userInfo.email}</MenuItem>}
                        <MenuItem onClick={() => dispatch(logOut())}>Logout</MenuItem>
                    </Menu>
                </Box>
            }
        </>
    );
};

export default UserProfile;
