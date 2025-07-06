import { useLocation, Link } from "react-router-dom";
import { PlusCircle, BarChart3 } from "lucide-react";
import { useTranslation } from "react-i18next";

export const HeaderNavigation = () => {
  const location = useLocation();
  const { t } = useTranslation();

  const navigation = [
    {
      name: t("nav.dashboard"),
      href: "/",
      icon: BarChart3,
      current: location.pathname === "/",
    },
    {
      name: t("nav.addPurchase"),
      href: "/add-purchase",
      icon: PlusCircle,
      current: location.pathname === "/add-purchase",
    },
  ];
  return (
    <nav className="hidden md:flex space-x-8">
      {navigation.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.name}
            to={item.href}
            className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors duration-200 ${
              item.current
                ? "text-primary-600 border-b-2 border-primary-600"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <Icon className="w-4 h-4 mr-2" />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
};
