import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  Plus,
  BarChart3,
  Settings,
} from "lucide-react";

import { useGetDashboardQuery } from "../store/api/stockApi";

import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { AuthDebug } from "../components/debug/AuthDebug";

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const { data: dashboardData, isLoading, error } = useGetDashboardQuery();
  const [showDebug, setShowDebug] = useState(false);

  if (isLoading) {
    return (
      <div>
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"
              ></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="mb-4 flex justify-end">
          <Button
            onClick={() => setShowDebug(!showDebug)}
            variant="secondary"
            size="sm"
            leftIcon={<Settings className="w-4 h-4" />}
          >
            Debug Info
          </Button>
        </div>

        {showDebug && <AuthDebug />}

        <Card className="text-center py-12">
          <div className="text-danger-600 dark:text-danger-400 mb-4">
            <BarChart3 className="mx-auto h-12 w-12" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {t("dashboard.error.title")}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {t("dashboard.error.message")}
          </p>
          <Button as={Link} to="/add" variant="primary">
            {t("dashboard.addFirstStock")}
          </Button>
        </Card>
      </div>
    );
  }

  if (!dashboardData || dashboardData.stocks.length === 0) {
    return (
      <div>
        <Card className="text-center py-12">
          <div className="text-gray-400 dark:text-gray-600 mb-4">
            <PieChart className="mx-auto h-12 w-12" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {t("dashboard.empty.title")}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {t("dashboard.empty.message")}
          </p>
          <Button
            as={Link}
            to="/add-purchase"
            variant="primary"
            leftIcon={<Plus size={16} />}
          >
            {t("dashboard.addFirstStock")}
          </Button>
        </Card>
      </div>
    );
  }

  const isProfit = dashboardData.profit_loss >= 0;

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button
          onClick={() => setShowDebug(!showDebug)}
          variant="secondary"
          size="sm"
          leftIcon={<Settings className="w-4 h-4" />}
        >
          Debug Info
        </Button>
      </div>

      {showDebug && <AuthDebug />}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t("dashboard.title")}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {t("dashboard.subtitle")}
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button
              as={Link}
              to="/add-purchase"
              variant="primary"
              leftIcon={<Plus size={16} />}
            >
              {t("dashboard.addPurchase")}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t("dashboard.stats.totalSpent")}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${dashboardData.total_spent.toFixed(2)}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <PieChart className="h-8 w-8 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t("dashboard.stats.currentValue")}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${dashboardData.current_value.toFixed(2)}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {isProfit ? (
                  <TrendingUp className="h-8 w-8 text-success-600" />
                ) : (
                  <TrendingDown className="h-8 w-8 text-danger-600" />
                )}
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t("dashboard.stats.profitLoss")}
                </p>
                <p
                  className={`text-2xl font-bold ${
                    isProfit ? "text-success-600" : "text-danger-600"
                  }`}
                >
                  {isProfit ? "+" : ""}${dashboardData.profit_loss.toFixed(2)}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3
                  className={`h-8 w-8 ${
                    isProfit ? "text-success-600" : "text-danger-600"
                  }`}
                />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t("dashboard.stats.percentage")}
                </p>
                <p
                  className={`text-2xl font-bold ${
                    isProfit ? "text-success-600" : "text-danger-600"
                  }`}
                >
                  {isProfit ? "+" : ""}
                  {dashboardData.profit_loss_percentage.toFixed(2)}%
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Stocks Table */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              {t("dashboard.portfolio.title")}
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {dashboardData.stocks.length} {t("dashboard.portfolio.stocks")}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="table">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th>{t("dashboard.table.symbol")}</th>
                  <th className="text-right">
                    {t("dashboard.table.quantity")}
                  </th>
                  <th className="text-right">
                    {t("dashboard.table.currentPrice")}
                  </th>
                  <th className="text-right">
                    {t("dashboard.table.totalValue")}
                  </th>
                  <th className="text-right">
                    {t("dashboard.table.totalSpent")}
                  </th>
                  <th className="text-right">
                    {t("dashboard.table.profitLoss")}
                  </th>
                  <th className="text-right">{t("dashboard.table.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.stocks.map((stock) => {
                  const stockProfitLoss = stock.total_value - stock.total_spent;
                  const isStockProfit = stockProfitLoss >= 0;

                  return (
                    <tr key={stock.symbol}>
                      <td>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {stock.symbol}
                        </div>
                      </td>
                      <td className="text-right">
                        {stock.quantity.toFixed(0)}
                      </td>
                      <td className="text-right">
                        ${stock.current_price.toFixed(2)}
                      </td>
                      <td className="text-right font-medium">
                        ${stock.total_value.toFixed(2)}
                      </td>
                      <td className="text-right">
                        ${stock.total_spent.toFixed(2)}
                      </td>
                      <td
                        className={`text-right font-medium ${
                          isStockProfit ? "text-success-600" : "text-danger-600"
                        }`}
                      >
                        {isStockProfit ? "+" : ""}${stockProfitLoss.toFixed(2)}
                      </td>
                      <td className="text-right">
                        <Button
                          as={Link}
                          to={`/stock/${stock.symbol}`}
                          variant="ghost"
                          size="sm"
                        >
                          {t("dashboard.table.view")}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
