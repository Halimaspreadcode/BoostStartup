import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ThemeToggle } from './components/ThemeToggle';
import { LayoutGrid, ListChecks, Workflow, FileText } from 'lucide-react';
import { StartupList } from './pages/StartupList';
import { ActionsList } from './pages/ActionsList';
import { Workspace } from './pages/Workspace';
import { WorkspaceResults } from './pages/WorkspaceResults';

function Navigation() {
  const location = useLocation();
  
  const links = [
    { to: '/', icon: LayoutGrid, label: 'Startups' },
    { to: '/actions', icon: ListChecks, label: 'Actions' },
    { to: '/workspace', icon: Workflow, label: 'Workspace' },
    { to: '/workspace-results', icon: FileText, label: 'Résultats' },
  ];

  return (
    <header className="bg-white dark:bg-stone-950 border-b dark:border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <nav className="flex items-center space-x-4">
            {links.map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === to
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 dark:bg-stone-950">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<StartupList />} />
            <Route path="/actions" element={<ActionsList />} />
            <Route path="/workspace" element={<Workspace />} />
            <Route path="/workspace-results" element={<WorkspaceResults />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;