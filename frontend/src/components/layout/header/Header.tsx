import React from "react";
import { LogOut, User } from "lucide-react";

import { useAppDispatch, useAppSelector } from "../../../store";
import { logout, selectUser } from "../../../store/slices/authSlice";
import ThemeToggle from "../../ui/ThemeToggle";
import LanguageSelector from "./../LanguageSelector";
import { Button } from "../../ui/Button";

import { useI18nReady } from "../../../hooks/useI18nReady";
import { SkeletonDashboardHeader } from "../../ui/loading/SkeletonHeader";
import { HeaderLogo } from "./components/HeaderLogo";
import { HeaderNavigation } from "./components/HeaderNavigation";

export const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const { isReady } = useI18nReady();

  const handleLogout = () => {
    dispatch(logout());
  };

  if (!isReady) {
    return <SkeletonDashboardHeader />;
  }

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <HeaderLogo />
          <HeaderNavigation />

          {/* Controls */}
          <div className="flex items-center space-x-4">
            {/* User Info */}
            {user && (
              <div className="hidden md:flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                  <User className="h-4 w-4" />
                  <span>{user.username}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  leftIcon={<LogOut className="h-4 w-4" />}
                >
                  Logout
                </Button>
              </div>
            )}

            <LanguageSelector />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
};
