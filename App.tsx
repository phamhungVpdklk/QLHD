import React, { useState, useEffect } from 'react';
import ContractManager from './components/ContractManager';
import Dashboard from './components/Dashboard';
import { DocumentIcon } from './components/icons/DocumentIcon';
import { ChartBarIcon } from './components/icons/ChartBarIcon';
import { MoonIcon } from './components/icons/MoonIcon';
import { SunIcon } from './components/icons/SunIcon';
import { supabase } from './services/supabaseClient';
import { Session } from '@supabase/supabase-js';
import LoginPage from './components/LoginPage';
import { LogoutIcon } from './components/icons/LogoutIcon';

enum Tab {
  MANAGER = 'MANAGER',
  DASHBOARD = 'DASHBOARD',
}

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>(Tab.MANAGER);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const renderContent = () => {
    switch (activeTab) {
      case Tab.MANAGER:
        return <ContractManager />;
      case Tab.DASHBOARD:
        return <Dashboard />;
      default:
        return null;
    }
  };

  const TabButton = ({ tab, label, icon }: { tab: Tab, label: string, icon: React.ReactNode }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-colors duration-200 rounded-t-lg border-b-2 ${
        activeTab === tab
          ? 'text-blue-600 border-blue-600'
          : 'text-slate-500 dark:text-slate-400 border-transparent hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-500'
      }`}
    >
      {icon}
      {label}
    </button>
  );
  
  if (isLoading) {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
            <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        </div>
    );
  }

  if (!session) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
      <header className="bg-white dark:bg-slate-800 shadow-sm dark:shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <svg className="w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20ZM12 15L8 11H11V8H13V11H16L12 15Z"/>
              </svg>
              <h1 className="text-xl font-bold text-slate-800 dark:text-slate-200">Trợ lý Quản lý Hợp đồng</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600 dark:text-slate-400 hidden sm:block">
                {session.user.email}
              </span>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-800"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? <MoonIcon className="h-6 w-6" /> : <SunIcon className="h-6 w-6" />}
              </button>
               <button
                  onClick={handleLogout}
                  className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-800"
                  aria-label="Đăng xuất"
              >
                  <LogoutIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
          <nav className="flex flex-wrap border-b border-slate-200 dark:border-slate-700 -mb-px">
            <TabButton tab={Tab.MANAGER} label="Quản lý Hợp đồng" icon={<DocumentIcon />} />
            <TabButton tab={Tab.DASHBOARD} label="Báo cáo & Thống kê" icon={<ChartBarIcon />} />
          </nav>
        </div>
      </header>
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
