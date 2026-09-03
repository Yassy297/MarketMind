import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './AppRoutes';
import { AuthProvider } from './context/AuthContext';
import { MarketProvider } from './context/MarketContext';

function App() {
  return (
    <AuthProvider>
      <MarketProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </MarketProvider>
    </AuthProvider>
  );
}

export default App;
