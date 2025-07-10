import React from "react";
import { useTranslation } from "react-i18next";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  BarChart3,
} from "lucide-react";
import { DashboardStatisticWidget } from "../ui/DashboardStatisticWidget";

interface DashboardData {
  totalSpent: number;
  totalValue: number;
  profitLoss: number;
  profitLossPercentage: number;
}

interface DashboardStatsProps {
  dashboardData: DashboardData;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  dashboardData,
}) => {
  const { t } = useTranslation();
  const isProfit = dashboardData.profitLoss >= 0;

  const stats = [
    {
      id: 1,
      name: t("dashboard.stats.currentValue"),
      value: `$${dashboardData.totalValue.toFixed(2)}`,
      icon: PieChart,
      iconColor: "text-success-600",
      valueColor: "text-gray-900 dark:text-white",
    },
    {
      id: 2,
      name: t("dashboard.stats.totalSpent"),
      value: `$${dashboardData.totalSpent.toFixed(2)}`,
      icon: DollarSign,
      iconColor: "text-primary-600",
      valueColor: "text-gray-900 dark:text-white",
    },
    {
      id: 3,
      name: t("dashboard.stats.profitLoss"),
      value: `${isProfit ? "+" : ""}$${dashboardData.profitLoss.toFixed(2)}`,
      icon: isProfit ? TrendingUp : TrendingDown,
      iconColor: isProfit ? "text-success-600" : "text-danger-600",
      valueColor: isProfit ? "text-success-600" : "text-danger-600",
    },
    {
      id: 4,
      name: t("dashboard.stats.percentage"),
      value: `${isProfit ? "+" : ""}${dashboardData.profitLossPercentage.toFixed(2)}%`,
      icon: BarChart3,
      iconColor: isProfit ? "text-success-600" : "text-danger-600",
      valueColor: isProfit ? "text-success-600" : "text-danger-600",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mx-auto max-w-2xl lg:max-w-none">
        <dl className="grid grid-cols-1 gap-4 overflow-hidden rounded-lg text-center sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <DashboardStatisticWidget
              key={stat.id}
              id={stat.id}
              name={stat.name}
              value={stat.value}
              icon={stat.icon}
              iconColor={stat.iconColor}
              valueColor={stat.valueColor}
              layout="vertical"
            />
          ))}
        </dl>
      </div>
    </div>
  );
};
