import { CssBaseline, StyledEngineProvider, ThemeProvider } from '@mui/material';
import { RootState } from './config/store';
import { useSelector } from 'react-redux';
import theme from './themes';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
//import { useEffect } from 'react';
import Login from './pages/Login';
import FileUpload from './pages/FileUpload';
import DropFile from './pages/DropFile';

function App() {
  const customization = useSelector((state: RootState) => state.theme);
  //const { token, googleToken, microsoftToken } = useSelector((state: RootState) => state.auth);

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme(customization)}>
        <CssBaseline />
        <Router>
          <Routes>
            <Route path='/' element={<Login />} />
            <Route path='/file-upload' element={<FileUpload />} />
            <Route path='/drop-file' element={<DropFile />} />
            <Route path='/dashboard' element={<Dashboard />} />
          </Routes>
          {/* <NavigationGuard token={token || googleToken || microsoftToken} /> */}
        </Router>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}

// NavigationGuard component to handle token check and navigation
// const NavigationGuard: React.FC<{ token: string | null }> = ({ token }) => {
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (token) {
//       //  navigate('/dashboard'); // Redirect if token exists
//     } else {
//       navigate('/'); // Redirect to login if no token
//     }
//   }, [token, navigate]);

//   return null; // This component does not render anything
// };

export default App;
