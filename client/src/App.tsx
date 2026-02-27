import React from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { BatchDetails } from './pages/BatchDetails';

function App() {
  // Mock navigation state (replace with React Router or similar)
  const [currentPath, setCurrentPath] = React.useState('/');
  const [user, setUser] = React.useState({
    name: 'John Doe',
    role: 'Warehouse Manager',
  });

  const sidebarItems = [
    { id: '1', label: 'Dashboard', icon: '📊', path: '/dashboard' },
    { id: '2', label: 'Inventory', icon: '📦', path: '/inventory' },
    { id: '3', label: 'Monitoring', icon: '🌡️', path: '/monitoring' },
    { id: '4', label: 'Reports', icon: '📈', path: '/reports' },
  ];

  const handleLogout = () => {
    setUser(null);
    setCurrentPath('/');
  };

  const renderPage = () => {
    switch (currentPath) {
      case '/':
        return <LandingPage />;
      case '/dashboard':
        return <Dashboard />;
      case '/batch-details':
        return <BatchDetails />;
      default:
        return <LandingPage />;
    }
  };

  // Landing page doesn't need sidebar
  const showLayout = currentPath !== '/';

  return (
    <div className="flex flex-col min-h-screen">
      {showLayout && <Navbar userName={user?.name} userRole={user?.role} onLogout={handleLogout} />}
      
      <div className="flex flex-1">
        {showLayout && (
          <Sidebar
            items={sidebarItems}
            activePath={currentPath}
            onNavigate={setCurrentPath}
          />
        )}
        
        <main className="flex-1">
          {renderPage()}
        </main>
      </div>
      
      {showLayout && <Footer />}
    </div>
  );
}

export default App;
