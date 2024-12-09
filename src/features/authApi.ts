import { baseQueryApi } from "./baseQueryApi"

export const authApi = baseQueryApi.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation({
            query: (credentials) => {
                return {
                    url: 'BillingWebAPIDev/api/Login/ValidateUser',
                    method: 'POST',
                    body: credentials,
                }
            },
        }),
        getGoogleLogin: builder.query({
            query: () => ({
                url: 'GmailWebApi/api/auth/google/login',
                method: 'GET',
            }),
        }),
        uploadFile: builder.mutation({
            query: (body) => {
                return {
                    url: 'GmailWebApi/api/auth/google/ProcessPDFFiles',
                    method: 'POST',
                    body
                }
            }
        }),
    }),
})

export const {
    useLoginMutation,
    useGetGoogleLoginQuery,
    useUploadFileMutation
} = authApi
