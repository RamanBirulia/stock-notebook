import React from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { useI18nReady } from "../../hooks/i18n/useI18nReady";
import {SkeletonDashboardHeader} from "../ui/loading/SkeletonHeader";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isReady } = useI18nReady();

  return (
    <div className=" bg-gray-50 dark:bg-gray-900 flex flex-col">
      {isReady ? <Header /> : <SkeletonDashboardHeader />}
      <main className="min-h-screen max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
