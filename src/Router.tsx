import { useEffect, useState } from 'react';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Products } from './pages/Products';
import { Contact } from './pages/Contact';
import { Login } from './pages/admin/Login';
import { Dashboard } from './pages/admin/Dashboard';

interface RouterProps {
  initialPath?: string;
}

export function Router({ initialPath }: RouterProps = {}) {
  // SSR-safe: use initialPath from server or fallback to window location
  const [currentPath, setCurrentPath] = useState(
    initialPath || (typeof window !== 'undefined' ? window.location.pathname : '/')
  );

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);

    const originalPushState = window.history.pushState;
    window.history.pushState = function(...args) {
      originalPushState.apply(window.history, args);
      setCurrentPath(window.location.pathname);
    };

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.history.pushState = originalPushState;
    };
  }, []);

  const routes: Record<string, JSX.Element> = {
    '/': <Home />,
    '/about': <About />,
    '/products': <Products />,
    '/contact': <Contact />,
    '/admin': <Login />,
    '/admin/dashboard': <Dashboard />,
  };

  return routes[currentPath] || <Home />;
}
