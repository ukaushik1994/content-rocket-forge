
import { 
  Home, 
  FileText, 
  Settings,
  Rocket,
} from 'lucide-react';

export interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const navItems: NavItem[] = [
  { name: 'Dashboard', path: '/', icon: Home },
  { name: 'Content', path: '/content', icon: FileText },
  { name: 'Solutions', path: '/solutions', icon: Rocket },
  { name: 'Settings', path: '/settings', icon: Settings },
];
