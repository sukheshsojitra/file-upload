import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../reducers/authentication';
import Grid from '@mui/material/Grid2';
import { Box, Button, Card, CircularProgress, IconButton, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import Logo from '../assets/images/logo.svg'
import UserIcon from '@mui/icons-material/AccountCircleOutlined';
import Visibility from '@mui/icons-material/RemoveRedEyeOutlined';
import VisibilityOff from '@mui/icons-material/VisibilityOffOutlined';
import { useLoginMutation } from '../features/authApi';


// MSAL configuration
/* const msalConfig = {
    auth: {
        clientId: "b1635cbc-acaf-4952-8e05-c07070608492",
        authority: "https://login.microsoftonline.com/49125367-1ca7-4578-9121-9716601c0f19",
        redirectUri: "http://localhost:5173/",
    },
};
const pca = new PublicClientApplication(msalConfig); */

interface LoginFormInputs {
    userName: string;
    password: string;
}

const Login: React.FC = () => {
    // const theme = useTheme();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [errorMsg, setErrorMsg] = useState('');
    const [showPassword, setShowPassword] = useState<boolean>(false);

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const { register, control, handleSubmit, formState: { errors } } = useForm<LoginFormInputs>({
        defaultValues: {
            userName: '',
            password: '',
        }
    });
    const [login, { isLoading }] = useLoginMutation();

    // const { data: googleLogin } = useGetGoogleLoginQuery(null);

    // console.log(googleLogin)

    const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
        try {
            const result = await login(data);
            if (result?.data?.httpStatusCode === 200) {
                dispatch(setCredentials({ token: result.data.response, }));
                navigate('/file-upload');
            }
            else {
                setErrorMsg(result?.data?.message)
            }
        } catch (error) {
            console.error('Failed to log in:', error);
            setErrorMsg("No Server Response")
        }
    }

    // const redirectToLogin = () => {
    //     window.location.href = googleLogin.googleAuthUrl;
    // }
    return (
        <Grid container direction="column" justifyContent="flex-end" sx={{ minHeight: '100vh' }}>
            <Grid size={12}>
                <Grid container justifyContent="center" alignItems="center" sx={{ minHeight: 'calc(100vh - 68px)' }}>
                    <Grid sx={{ m: { xs: 1, sm: 3 }, mb: 0 }}>
                        <Card sx={{ maxWidth: { xs: 400, lg: 475 }, margin: { xs: 2.5, md: 3 }, borderRadius: '12px', boxShadow: 'none' }}>
                            <Box sx={{ p: { xs: 2, sm: 3, xl: 5 } }}>
                                <Grid container alignItems="center" justifyContent="center">
                                    <Grid sx={{ mb: 3 }} display="flex" alignItems="center">
                                        <img src={Logo} alt="Catex" />
                                    </Grid>
                                    <Grid size={12}>
                                        <Grid container alignItems="center" justifyContent="center">
                                            <Grid>
                                                <Stack alignItems="center" justifyContent="center" spacing={1}>
                                                    <Typography variant="h6" fontSize="16px">
                                                        Enter your credentials to continue
                                                    </Typography>
                                                    {errorMsg && <Typography color="error">
                                                        {errorMsg}
                                                    </Typography>}
                                                </Stack>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                    <Grid size={12}>
                                        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }}>
                                            <Controller
                                                name="userName"
                                                control={control}
                                                render={({ field: { value } }) => (
                                                    <TextField
                                                        value={value}
                                                        label="User Name"
                                                        sx={{ mt: 2, mb: 1 }}
                                                        fullWidth
                                                        {...register("userName", {
                                                            required: "This field is required",
                                                            minLength: {
                                                                value: 5,
                                                                message: "Length must be 5 or more"
                                                            },
                                                            maxLength: {
                                                                value: 15,
                                                                message: "max 15"
                                                            }
                                                        })}
                                                        error={errors.userName && true}
                                                        helperText={errors.userName?.message}
                                                        slotProps={{
                                                            input: {
                                                                endAdornment: (
                                                                    <InputAdornment position="end">
                                                                        <UserIcon />
                                                                    </InputAdornment>
                                                                ),
                                                            },
                                                        }}
                                                    />
                                                )}
                                            />
                                            <Controller
                                                name="password"
                                                control={control}
                                                render={({ field: { value } }) => (
                                                    <TextField
                                                        value={value}
                                                        label="Password"
                                                        type={showPassword ? 'text' : 'password'}
                                                        fullWidth
                                                        sx={{ mt: 2, mb: 1 }}
                                                        {...register("password", {
                                                            required: "This field is required",
                                                            minLength: {
                                                                value: 5,
                                                                message: "Length must be 5 or more"
                                                            },
                                                            maxLength: {
                                                                value: 15,
                                                                message: "max 15"
                                                            }
                                                        })}
                                                        error={errors.password && true}
                                                        helperText={errors.password?.message}
                                                        slotProps={{
                                                            input: {
                                                                endAdornment: (
                                                                    <InputAdornment position="end">
                                                                        <IconButton
                                                                            aria-label="toggle password visibility"
                                                                            onClick={handleClickShowPassword}
                                                                            edge="end"
                                                                            size="large"
                                                                        >
                                                                            {showPassword ? <Visibility /> : <VisibilityOff />}
                                                                        </IconButton>
                                                                    </InputAdornment>
                                                                ),
                                                            },
                                                        }}
                                                    />
                                                )}
                                            />
                                            <Button
                                                type="submit"
                                                fullWidth
                                                variant="contained"
                                                size="large"
                                                color="primary"
                                                sx={{ mt: 3, mb: 2 }}
                                                disabled={isLoading}
                                            >
                                                {isLoading ? <CircularProgress size={25} />
                                                    :
                                                    'Login'
                                                }
                                            </Button>
                                        </Box>
                                    </Grid>
                                    {/* <Grid size={12}>
                                        <Box
                                            sx={{
                                                alignItems: 'center',
                                                display: 'flex'
                                            }}
                                        >
                                            <Divider sx={{ flexGrow: 1 }} orientation="horizontal" />

                                            <Button
                                                variant="outlined"
                                                sx={{
                                                    cursor: 'unset',
                                                    m: 2,
                                                    py: 0.5,
                                                    px: 7,
                                                    borderColor: `${theme.palette.grey[100]} !important`,
                                                    color: `${theme.palette.grey[900]}!important`,
                                                    fontWeight: 500,
                                                    borderRadius: `12px`
                                                }}
                                                disableRipple
                                                disabled
                                            >
                                                OR
                                            </Button>

                                            <Divider sx={{ flexGrow: 1 }} orientation="horizontal" />
                                        </Box>
                                    </Grid>
                                    <Box display="flex" flexDirection="column" gap={2} width="100%">
                                        <GoogleOAuthProvider clientId="270893462562-accfl94amcacmi3qmbql8d3cap3pgmdk.apps.googleusercontent.com">
                                            <GoogleAuth />
                                        </GoogleOAuthProvider>
                                         <MsalProvider instance={pca}>
                                            <MicrosoftAuth />
                                        </MsalProvider> 
                                        <Divider sx={{ flexGrow: 1 }} orientation="horizontal" />
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            startIcon={<GoogleIcon />}
                                            onClick={redirectToLogin}
                                        >
                                            Sign in with Google
                                        </Button>
                                    </Box>
                                     */}
                                </Grid>
                            </Box>
                        </Card>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
};

export default Login;
