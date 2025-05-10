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

import { MainNavItem, SidebarNavItem } from "@/types";

interface NavItemsProps {
  isDashboard?: boolean;
}

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
