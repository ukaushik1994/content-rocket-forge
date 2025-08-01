
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Home } from 'lucide-react';
import NavItems from './NavItems';

const Navbar = () => {
  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <Home className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">Content Platform</span>
          </Link>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pl-1 pr-0">
            <div className="px-7">
              <Link to="/" className="flex items-center space-x-2">
                <Home className="h-6 w-6" />
                <span className="font-bold">Content Platform</span>
              </Link>
            </div>
            <div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
              <NavItems />
            </div>
          </SheetContent>
        </Sheet>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <Link to="/" className="flex items-center space-x-2 md:hidden">
              <Home className="h-6 w-6" />
              <span className="font-bold">Content Platform</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
