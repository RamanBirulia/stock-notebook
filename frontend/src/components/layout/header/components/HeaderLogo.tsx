import { Link } from "react-router-dom";
import { TrendingUp } from "lucide-react";

export const HeaderLogo = () => {
  return (
    <div className="flex items-center">
      <Link to="/" className="flex items-center space-x-2">
        <TrendingUp className="h-8 w-8 text-primary-600" />
        <span className="text-xl font-bold text-gray-900 dark:text-white">
          Stock Tracker
        </span>
      </Link>
    </div>
  );
};
