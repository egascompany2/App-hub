import { Link } from './Link';
import { X } from 'lucide-react';

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function Sidebar({ isOpen, onClose }: SidebarProps) {

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-primary bg-opacity-50 lg:hidden z-20"
          onClick={onClose}
        />
      )}
      
      <aside className={`
        w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 z-30
        transform transition-transform duration-200 ease-in-out
        lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <img src="/icons/logo.svg" alt="Egas" className="w-8 h-8" />
              <span className="text-xl font-semibold">Egas</span>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>
          
          <nav className="space-y-3">
            <Link to="/">
              <img src="/icons/dashboard.svg" alt="Dashboard" className="w-[20px] h-[20px]" />
              Dashboard
            </Link>
            <Link to="/products">
              <img src="/icons/product.svg" alt="Products" className="w-[20px] h-[20px]" />
              Products
            </Link>
            <Link to="/orders">
              <img src="/icons/orders.svg" alt="Orders" className="w-[20px] h-[20px]" />
              Orders
            </Link>
            <Link to="/customers">
              <img src="/icons/customers.svg" alt="Customers" className="w-[20px] h-[20px]" />
              Customers
            </Link>
            <Link to="/delivery">
              <img src="/icons/car.svg" alt="Delivery" className="w-[20px] h-[20px]" />
              Delivery Personnel
            </Link>
          </nav>
          
        </div>
        <div className='h-[1px] w-full bg-gray-200' />

        <div className='p-6 flex items-center gap-3'>
        <Link to="/settings"
        >
          <img src="/icons/setting.svg" alt="Settings" className="w-[20px] h-[20px]" />
          Settings
        </Link>
        </div>
      </aside>
    </>
  );
}