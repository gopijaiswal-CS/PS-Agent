import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { Breadcrumbs } from './Breadcrumbs';

export const MainLayout = () => {
  const location = useLocation();
  const isPracticeSession = location.pathname === '/practice';

  return (
    <div className="flex flex-col min-h-screen bg-theme text-theme transition-colors duration-300">
      <Navbar />
      <Breadcrumbs />
      <main className="flex-1 w-full relative flex flex-col min-h-0">
        <Outlet />
      </main>
      {!isPracticeSession && <Footer />}
    </div>
  );
};
