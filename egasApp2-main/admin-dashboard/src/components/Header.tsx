
// import { Bell } from 'lucide-react';
import { AvatarComponent } from './Avatar';
import { MobileMenuButton } from './MobileMenuButton';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between md:justify-end px-4 lg:px-6 fixed top-0 right-0 left-0 lg:left-64 z-10">
      <MobileMenuButton onClick={onMenuClick} />
      
      <div className="flex justify-end items-center gap-4">
        <AvatarComponent />
      </div>
    </header>
  );
}