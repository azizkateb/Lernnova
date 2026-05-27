import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';

const DashboardLayout = ({ children }) => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen overflow-x-clip bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-500">
      <div className="flex flex-1 min-w-0">
        <Sidebar role={user?.role} />
        <main className="min-w-0 flex-1 overflow-x-clip p-4 sm:p-6 lg:p-10 xl:p-12">
          <div className="mx-auto max-w-6xl">
            <div className="min-w-0">
              {children ?? <Outlet />}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
