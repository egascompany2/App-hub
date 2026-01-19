import { Link as RouterLink } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

interface LinkProps {
  to: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export function Link({ to, children, icon }: LinkProps) {
  const location = useLocation();
  const active = location.pathname === to;

  return (
    <RouterLink
      to={to}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#64748B] ${
        active
          ? 'bg-[#FAFAFB] text-primary'
          : 'hover:bg-[#FAFAFB] hover:text-primary'
      }`}
    >
      {icon}
      {children}
    </RouterLink>
  );
}