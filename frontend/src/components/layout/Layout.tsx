import React from "react";
import { Header } from "./header/Header";
import { Footer } from "./Footer";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className=" bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header />
      <main className="min-h-screen w-full max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
