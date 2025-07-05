import ThemeToggle from "../ui/ThemeToggle";
import LanguageSelector from "../layout/LanguageSelector";
import { TrendingUp, LogIn } from "lucide-react";
import { Button } from "../ui/Button";

interface LandingHeaderProps {
  handleSignInClick: () => void;
}

export const LandingHeader = ({ handleSignInClick }: LandingHeaderProps) => {
  return (
    <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              Stock Tracker
            </span>
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center space-x-4">
            <a
              href="mailto:raman.birulia@gmail.com?subject=Support Request - Stock Tracker"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Support
            </a>
            <LanguageSelector />
            <ThemeToggle />
            <Button
              onClick={handleSignInClick}
              variant="primary"
              size="sm"
              leftIcon={<LogIn className="h-4 w-4" />}
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
