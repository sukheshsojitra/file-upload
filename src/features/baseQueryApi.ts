import { createApi, fetchBaseQuery, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { RootState } from '../config/store'; // Assuming you have a RootState type for your Redux store
import { logOut } from '../reducers/authentication';

const BASE_URL = "http://10.100.88.40";

const baseQuery = fetchBaseQuery({
    baseUrl: BASE_URL,
    //credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
        const token = (getState() as RootState).auth.token; // Explicitly typing getState return value as RootState
        if (token) {
            headers.set("authorization", `Bearer ${token}`);
        }
        return headers;
    }
});

const baseQueryWithReauth = async (args: Parameters<typeof baseQuery>[0], api: Parameters<typeof baseQuery>[1], extraOptions: Parameters<typeof baseQuery>[2]) => {
    const result = await baseQuery(args, api, extraOptions);
    if ((result as { error?: FetchBaseQueryError })?.error?.data === 401) {
        console.log(result);
        api.dispatch(logOut());
    }
    /* if (result?.error?.originalStatus === 403) {
         console.log('sending refresh token')
         // send refresh token to get new access token 
         const refreshResult = await baseQuery('/refresh', api, extraOptions)
         console.log(refreshResult)
         if (refreshResult?.data) {
             const user = api.getState().auth.user
             // store the new token 
             api.dispatch(setCredentials({ ...refreshResult.data, user }))
             // retry the original query with new access token 
             result = await baseQuery(args, api, extraOptions)
         } else {
             api.dispatch(logOut())
         }
     }*/

    return result;
}

export const baseQueryApi = createApi({
    baseQuery: baseQueryWithReauth,
    endpoints: () => ({})
});
