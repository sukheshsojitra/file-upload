import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { GmailMessage } from "../hooks/useFetchGoogleEmails";

interface AuthState {
    token: string | null;
    googleToken: string | null;
    microsoftToken: string | null;
    emails: GmailMessage[];
    userInfo: TokenPayload,
}
export interface TokenPayload {
    name?: string;
    email?: string;
    picture?: string;
    sub?: string; // User ID
    exp?: number; // Expiry time
}


const initialState: AuthState = {
    token: localStorage.getItem('token') ? JSON.parse(localStorage.getItem('token') as string) : null,
    googleToken: localStorage.getItem('googleToken') ? JSON.parse(localStorage.getItem('googleToken') as string) : null,
    microsoftToken: localStorage.getItem('microsoftToken') ? JSON.parse(localStorage.getItem('microsoftToken') as string) : null,
    emails: [],
    userInfo: {},
}

export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setCredentials: (state, action: PayloadAction<{ token: string }>) => {
            state.token = action.payload.token;
            localStorage.setItem('token', JSON.stringify(action.payload.token));
        },
        setGoogleToken: (state, action: PayloadAction<{ googleToken: string }>) => {
            state.googleToken = action.payload.googleToken;
            localStorage.setItem('googleToken', JSON.stringify(action.payload.googleToken));
        },
        setMicrosoftToken: (state, action: PayloadAction<{ microsoftToken: string }>) => {
            state.microsoftToken = action.payload.microsoftToken;
            localStorage.setItem('microsoftToken', JSON.stringify(action.payload.microsoftToken));
        },
        setEmails: (state, action) => {
            state.emails = action.payload;
        },
        setUser: (state, action) => {
            state.userInfo = action.payload;
        },
        logOut: (state) => {
            localStorage.clear();
            state.token = null;
            state.googleToken = null;
            state.microsoftToken = null;
            state.emails = [];
            state.userInfo = {};
        }
    }
});
export const { setCredentials, setGoogleToken, setMicrosoftToken, setEmails, setUser, logOut } = authSlice.actions

export default authSlice.reducer