
import React from 'react';
import { 
  Home, 
  FileText, 
  PlusCircle, 
  Recycle, 
  CheckCircle, 
  Settings, 
  Puzzle, 
  BarChart3,
  Megaphone
} from 'lucide-react';

export const navItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: Home,
  },
  {
    title: "Drafts",
    href: "/drafts",
    icon: FileText,
  },
  {
    title: "Content Builder",
    href: "/content-builder",
    icon: PlusCircle,
  },
  {
    title: "Content Repurposing",
    href: "/content-repurposing",
    icon: Recycle,
  },
  {
    title: "Content Approval",
    href: "/content-approval",
    icon: CheckCircle,
  },
  {
    title: "Advocacy",
    href: "/advocacy",
    icon: Megaphone,
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Solutions",
    href: "/solutions",
    icon: Puzzle,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];
