import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Share,
} from "lucide-react";

import { useGetStockQuery, useGetStockChartQuery } from "../store/api/stockApi";
import { ChartPeriod } from "../store/api/models";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { StockChart } from "../components/charts/StockChart";

export const StockDetailsPage: React.FC = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [selectedPeriod, setSelectedPeriod] = useState<ChartPeriod>("1M");

  // API queries
  const {
    data: stockData,
    isLoading: isLoadingStock,
    error: stockError,
  } = useGetStockQuery(symbol || "", {
    skip: !symbol,
  });

  const {
    data: chartData,
    isLoading: isLoadingChart,
    error: chartError,
  } = useGetStockChartQuery(
    { symbol: symbol || "", period: selectedPeriod },
    {
      skip: !symbol,
      pollingInterval: 60000, // Poll every minute for live data
    },
  );

  // Handle back navigation
  const handleBack = () => {
    navigate(-1);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value.toFixed(2)}%`;
  };

  // Format number with commas
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  if (!symbol) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          {t("stock.details.errors.symbolNotProvided")}
        </p>
        <Button onClick={handleBack} className="mt-4">
          {t("common.back")}
        </Button>
      </div>
    );
  }

  if (stockError) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">
          {t("stock.details.errors.loadingError")}
        </p>
        <Button onClick={handleBack} variant="secondary">
          {t("common.back")}
        </Button>
      </div>
    );
  }

  if (isLoadingStock) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button onClick={handleBack} variant="secondary" size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-32"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-6">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!stockData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          {t("stock.details.errors.stockNotFound")}
        </p>
        <Button onClick={handleBack} variant="secondary" className="mt-4">
          {t("common.back")}
        </Button>
      </div>
    );
  }

  const profitLossPercentage =
    stockData.total_spent > 0
      ? (stockData.profit_loss / stockData.total_spent) * 100
      : 0;

  const isProfit = stockData.profit_loss >= 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button onClick={handleBack} variant="secondary" size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {stockData.symbol}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t("stock.details.currentPrice")}:{" "}
              {formatCurrency(stockData.current_price)}
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Share className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t("stock.details.metrics.totalShares")}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatNumber(stockData.total_quantity)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t("stock.details.metrics.currentValue")}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(stockData.current_value)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <DollarSign className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t("stock.details.metrics.totalInvested")}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(stockData.total_spent)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${
                isProfit
                  ? "bg-green-100 dark:bg-green-900/20"
                  : "bg-red-100 dark:bg-red-900/20"
              }`}
            >
              {isProfit ? (
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t("stock.details.metrics.profitLoss")}
              </p>
              <p
                className={`text-2xl font-bold ${
                  isProfit
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {formatCurrency(stockData.profit_loss)}
              </p>
              <p
                className={`text-sm ${
                  isProfit
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {formatPercentage(profitLossPercentage)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Chart Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {t("stock.details.chart.title")}
          </h2>
          <div className="flex gap-2">
            {(["1M", "1Y", "5Y"] as ChartPeriod[]).map((period) => (
              <Button
                key={period}
                variant={selectedPeriod === period ? "primary" : "secondary"}
                size="sm"
                onClick={() => setSelectedPeriod(period)}
              >
                {t(`stock.details.chart.periods.${period}`)}
              </Button>
            ))}
          </div>
        </div>

        {isLoadingChart ? (
          <div className="h-96 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"></div>
        ) : chartError ? (
          <div className="h-96 flex items-center justify-center text-gray-500 dark:text-gray-400">
            {t("stock.details.errors.chartError")}
          </div>
        ) : chartData ? (
          <StockChart data={chartData} height={400} />
        ) : null}
      </Card>

      {/* Purchase History */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          {t("stock.details.purchaseHistory.title")}
        </h2>

        {stockData.purchases.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            {t("stock.details.purchaseHistory.empty")}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    {t("stock.details.purchaseHistory.table.date")}
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    {t("stock.details.purchaseHistory.table.quantity")}
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    {t("stock.details.purchaseHistory.table.pricePerShare")}
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    {t("stock.details.purchaseHistory.table.commission")}
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    {t("stock.details.purchaseHistory.table.totalCost")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {stockData.purchases.map((purchase) => {
                  const totalCost =
                    purchase.quantity * purchase.price_per_share +
                    purchase.commission;
                  return (
                    <tr
                      key={purchase.id}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td className="py-3 px-4 text-gray-900 dark:text-white">
                        {format(
                          new Date(purchase.purchase_date),
                          "MMM dd, yyyy",
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-900 dark:text-white">
                        {formatNumber(purchase.quantity)}
                      </td>
                      <td className="py-3 px-4 text-gray-900 dark:text-white">
                        {formatCurrency(purchase.price_per_share)}
                      </td>
                      <td className="py-3 px-4 text-gray-900 dark:text-white">
                        {formatCurrency(purchase.commission)}
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(totalCost)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default StockDetailsPage;
