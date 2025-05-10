
import React from "react";
import {
  Home,
  LayoutDashboard,
  FileText,
  Settings,
  FolderOpen,
  FilePen,
  Link,
} from "lucide-react";

// Define the types locally instead of importing from @/types
interface MainNavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

interface SidebarNavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

// Use a single interface and export it
export interface NavItemsProps {
  isDashboard?: boolean;
}

export const mainNavItems: MainNavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: <Home className="h-4 w-4 mr-2" />,
  },
  {
    title: "Content Builder",
    href: "/content-builder",
    icon: <FileText className="h-4 w-4 mr-2" />,
  },
  {
    title: "Content Library",
    href: "/content",
    icon: <FolderOpen className="h-4 w-4 mr-2" />,
  },
  {
    title: "Drafts",
    href: "/drafts",
    icon: <FilePen className="h-4 w-4 mr-2" />,
  },
  {
    title: "Interlinking",
    href: "/interlinking",
    icon: <Link className="h-4 w-4 mr-2" />,
  },
];

export const sidebarNavItems: SidebarNavItem[] = [
  {
    title: "Settings",
    href: "/settings",
    icon: <Settings className="h-4 w-4 mr-2" />,
  },
];

// Create a default export function to fix the import in Navbar.tsx
export default function NavItems({ isDashboard }: NavItemsProps) {
  return (
    <>
      {mainNavItems.map((item) => (
        <a
          key={item.title}
          href={item.href}
          className="flex items-center gap-1 px-3 py-2 text-sm rounded-md hover:bg-accent/50"
        >
          {item.icon}
          <span>{item.title}</span>
        </a>
      ))}
    </>
  );
}
