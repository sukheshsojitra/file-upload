import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CustomizationOptions {
    fontFamily: string;
}

const initialState: CustomizationOptions = {
    fontFamily: 'Noto Sans, Arial, sans-serif',
};

const themeSlice = createSlice({
    name: 'theme',
    initialState,
    reducers: {
        setFontFamily: (state, action: PayloadAction<string>) => {
            state.fontFamily = action.payload;
        },
    },
});

export const { setFontFamily } = themeSlice.actions;
export default themeSlice.reducer;