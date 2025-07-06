import React from "react";
import { useTranslation } from "react-i18next";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  BarChart3,
} from "lucide-react";
import { Card } from "../ui/Card";

interface DashboardData {
  total_spent: number;
  current_value: number;
  profit_loss: number;
  profit_loss_percentage: number;
}

interface DashboardStatsProps {
  dashboardData: DashboardData;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  dashboardData,
}) => {
  const { t } = useTranslation();
  const isProfit = dashboardData.profit_loss >= 0;

  const stats = [
    {
      id: 1,
      name: t("dashboard.stats.currentValue"),
      value: `$${dashboardData.current_value.toFixed(2)}`,
      icon: PieChart,
      iconColor: "text-success-600",
      valueColor: "text-gray-900 dark:text-white",
    },
    {
      id: 2,
      name: t("dashboard.stats.totalSpent"),
      value: `$${dashboardData.total_spent.toFixed(2)}`,
      icon: DollarSign,
      iconColor: "text-primary-600",
      valueColor: "text-gray-900 dark:text-white",
    },
    {
      id: 3,
      name: t("dashboard.stats.profitLoss"),
      value: `${isProfit ? "+" : ""}$${dashboardData.profit_loss.toFixed(2)}`,
      icon: isProfit ? TrendingUp : TrendingDown,
      iconColor: isProfit ? "text-success-600" : "text-danger-600",
      valueColor: isProfit ? "text-success-600" : "text-danger-600",
    },
    {
      id: 4,
      name: t("dashboard.stats.percentage"),
      value: `${isProfit ? "+" : ""}${dashboardData.profit_loss_percentage.toFixed(2)}%`,
      icon: BarChart3,
      iconColor: isProfit ? "text-success-600" : "text-danger-600",
      valueColor: isProfit ? "text-success-600" : "text-danger-600",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mx-auto max-w-2xl lg:max-w-none">
        <dl className="grid grid-cols-1 gap-4 overflow-hidden rounded-lg text-center sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.id}>
                <div className="flex gap-x-4 justify-center">
                  <div className="flex justify-center mb-2">
                    <Icon className={`h-8 w-8 ${stat.iconColor}`} />
                  </div>
                  <dd
                    className={`text-3xl font-semibold tracking-tight ${stat.valueColor}`}
                  >
                    {stat.value}
                  </dd>
                </div>

                <dt className="text-sm/6 font-semibold text-gray-600 dark:text-gray-400">
                  {stat.name}
                </dt>
              </Card>
            );
          })}
        </dl>
      </div>
    </div>
  );
};
