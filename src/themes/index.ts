import { createTheme, Theme } from '@mui/material/styles';
import '@fontsource/noto-sans/300.css';
import '@fontsource/noto-sans/400.css';
import '@fontsource/noto-sans/500.css';
import '@fontsource/noto-sans/600.css';
import '@fontsource/noto-sans/700.css';
import { colors } from './colors';
import { componentStyleOverrides } from './compStyleOverride';

interface CustomizationOptions {
    fontFamily: string;
}

const theme = (customization: CustomizationOptions): Theme => {
    const color = colors;
    const themeOption = {
        colors: color,
        customization
    };
    const themeOptions = {
        mixins: {
            toolbar: {
                minHeight: '50px',
                '@media (min-width: 600px)': {
                    padding: 0,
                }
            }
        },
        typography: {
            fontFamily: 'Noto Sans, Arial, sans-serif',
        },
        palette: {
            background: {
                default: color.default, // Change this to your desired background color
            },
        },
    };
    const themes = createTheme(themeOptions);
    themes.components = componentStyleOverrides(themeOption);
    return themes
};

export default theme;