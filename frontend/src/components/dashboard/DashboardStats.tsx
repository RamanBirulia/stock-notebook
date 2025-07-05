import React from "react";
import { useTranslation } from "react-i18next";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  BarChart3,
} from "lucide-react";

import { StatCard } from "./StatCard";

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        icon={DollarSign}
        iconColor="text-primary-600"
        title={t("dashboard.stats.totalSpent")}
        value={`$${dashboardData.total_spent.toFixed(2)}`}
      />

      <StatCard
        icon={PieChart}
        iconColor="text-success-600"
        title={t("dashboard.stats.currentValue")}
        value={`$${dashboardData.current_value.toFixed(2)}`}
      />

      <StatCard
        icon={isProfit ? TrendingUp : TrendingDown}
        iconColor={isProfit ? "text-success-600" : "text-danger-600"}
        title={t("dashboard.stats.profitLoss")}
        value={`${isProfit ? "+" : ""}$${dashboardData.profit_loss.toFixed(2)}`}
        valueColor={isProfit ? "text-success-600" : "text-danger-600"}
      />

      <StatCard
        icon={BarChart3}
        iconColor={isProfit ? "text-success-600" : "text-danger-600"}
        title={t("dashboard.stats.percentage")}
        value={`${isProfit ? "+" : ""}${dashboardData.profit_loss_percentage.toFixed(2)}%`}
        valueColor={isProfit ? "text-success-600" : "text-danger-600"}
      />
    </div>
  );
};
