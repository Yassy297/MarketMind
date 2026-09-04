import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './AppRoutes';
import { AuthProvider } from './context/AuthContext';
import { MarketProvider } from './context/MarketContext';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <MarketProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </MarketProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
