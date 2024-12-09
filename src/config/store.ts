import { configureStore } from '@reduxjs/toolkit';
import { baseQueryApi } from '../features/baseQueryApi';
import authReducer from '../reducers/authentication'
import themeReducer from '../reducers/theme';
export const store = configureStore({
    reducer: {
        [baseQueryApi.reducerPath]: baseQueryApi.reducer,
        auth: authReducer,
        theme: themeReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(baseQueryApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;