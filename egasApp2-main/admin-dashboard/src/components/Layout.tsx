import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useMobileMenu } from '../hooks/useMobileMenu';

export function Layout() {
  const { isOpen, toggle, close } = useMobileMenu();

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar isOpen={isOpen} onClose={close} />
      <Header onMenuClick={toggle} />
      
      <main className="lg:pl-64 pt-16">
        <div className="p-4 lg:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}