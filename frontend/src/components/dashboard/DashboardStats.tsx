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
    <div className="grid grid-cols-2 @md:grid-cols-4 gap-6">
      <StatCard
        className="col-span-1"
        icon={DollarSign}
        iconColor="text-primary-600"
        title={t("dashboard.stats.totalSpent")}
        value={`$${dashboardData.total_spent.toFixed(2)}`}
      />

      <StatCard
        className="col-span-1"
        icon={PieChart}
        iconColor="text-success-600"
        title={t("dashboard.stats.currentValue")}
        value={`$${dashboardData.current_value.toFixed(2)}`}
      />

      <StatCard
        className="col-span-2 @md:col-span-1"
        icon={isProfit ? TrendingUp : TrendingDown}
        iconColor={isProfit ? "text-success-600" : "text-danger-600"}
        title={t("dashboard.stats.profitLoss")}
        value={`${isProfit ? "+" : ""}$${dashboardData.profit_loss.toFixed(2)}`}
        valueColor={isProfit ? "text-success-600" : "text-danger-600"}
      />

      <StatCard
        className="hidden @md:block @md:col-span-1"
        icon={BarChart3}
        iconColor={isProfit ? "text-success-600" : "text-danger-600"}
        title={t("dashboard.stats.percentage")}
        value={`${isProfit ? "+" : ""}${dashboardData.profit_loss_percentage.toFixed(2)}%`}
        valueColor={isProfit ? "text-success-600" : "text-danger-600"}
      />
    </div>
  );
};
