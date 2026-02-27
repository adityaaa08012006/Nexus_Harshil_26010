import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { BatchDetails } from './pages/BatchDetails';
import HomePage from './pages/HomePage';

function App() {
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
  };

  return (
    <Router>
      <Routes>
        {/* New Modern Home Page */}
        <Route path="/" element={<HomePage />} />
        
        {/* Old Landing Page (can be removed later) */}
        <Route path="/old-landing" element={<LandingPage />} />
        
        {/* Dashboard Routes with Layout */}
        <Route
          path="/dashboard/*"
          element={
            <div className="flex flex-col min-h-screen">
              <Navbar userName={user?.name} userRole={user?.role} onLogout={handleLogout} />
              <div className="flex flex-1">
                <Sidebar
                  items={sidebarItems}
                  activePath="/dashboard"
                  onNavigate={() => {}}
                />
                <main className="flex-1">
                  <Dashboard />
                </main>
              </div>
              <Footer />
            </div>
          }
        />
        
        {/* Batch Details Route */}
        <Route
          path="/batch-details"
          element={
            <div className="flex flex-col min-h-screen">
              <Navbar userName={user?.name} userRole={user?.role} onLogout={handleLogout} />
              <div className="flex flex-1">
                <Sidebar
                  items={sidebarItems}
                  activePath="/batch-details"
                  onNavigate={() => {}}
                />
                <main className="flex-1">
                  <BatchDetails />
                </main>
              </div>
              <Footer />
            </div>
          }
        />
        
        {/* Login page placeholder */}
        <Route path="/login" element={<div className="min-h-screen flex items-center justify-center bg-godam-cream"><div className="text-center"><h1 className="text-4xl font-heading font-bold text-gray-900 mb-4">Login Page</h1><p className="text-gray-600 font-body">Coming Soon...</p></div></div>} />
        
        {/* About page placeholder */}
        <Route path="/about" element={<div className="min-h-screen flex items-center justify-center bg-godam-cream"><div className="text-center"><h1 className="text-4xl font-heading font-bold text-gray-900 mb-4">About Us</h1><p className="text-gray-600 font-body">Coming Soon...</p></div></div>} />
        
        {/* Features page placeholder */}
        <Route path="/features" element={<div className="min-h-screen flex items-center justify-center bg-godam-cream"><div className="text-center"><h1 className="text-4xl font-heading font-bold text-gray-900 mb-4">Features</h1><p className="text-gray-600 font-body">Coming Soon...</p></div></div>} />
      </Routes>
    </Router>
  );
}

export default App;
