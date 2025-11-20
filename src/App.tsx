import { AuthProvider } from './contexts/AuthContext';
import { Router } from './Router';
import './i18n/config';

interface AppProps {
  initialPath?: string;
}

function App({ initialPath }: AppProps = {}) {
  return (
    <AuthProvider>
      <Router initialPath={initialPath} />
    </AuthProvider>
  );
}

export default App;
