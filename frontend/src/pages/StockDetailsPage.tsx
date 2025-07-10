import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";

import {
  useGetPurchasesBySymbolQuery,
  useGetStockPriceQuery,
  useGetStockChartQuery,
} from "../store/api/stockApi";
import { ChartPeriod } from "../store/api/models";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import {
  StockChart,
  StockStats,
  StockPurchaseHistory,
} from "../components/stock";

export const StockDetailsPage: React.FC = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [selectedPeriod, setSelectedPeriod] = useState<ChartPeriod>("1M");

  // API queries
  const {
    data: purchasesData,
    isLoading: isLoadingPurchases,
    error: purchasesError,
  } = useGetPurchasesBySymbolQuery(symbol || "", {
    skip: !symbol,
  });

  const {
    data: priceData,
    isLoading: isLoadingPrice,
    error: priceError,
  } = useGetStockPriceQuery(symbol || "", {
    skip: !symbol,
  });

  const {
    data: baseChartData,
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

  // Calculate stock details from purchases and current price
  const stockData = useMemo(() => {
    if (!purchasesData || !priceData) return null;

    const totalQuantity = purchasesData.reduce(
      (sum, purchase) => sum + purchase.quantity,
      0,
    );
    const totalSpent = purchasesData.reduce(
      (sum, purchase) =>
        sum +
        (purchase.quantity * purchase.pricePerShare + purchase.commission),
      0,
    );
    const currentValue = totalQuantity * priceData.price;
    const profitLoss = currentValue - totalSpent;

    return {
      symbol: symbol || "",
      purchases: purchasesData,
      totalQuantity,
      totalSpent,
      currentPrice: priceData.price,
      currentValue,
      profitLoss,
    };
  }, [purchasesData, priceData, symbol]);

  // Add purchase points to chart data
  const chartData = useMemo(() => {
    if (!baseChartData || !purchasesData) return baseChartData;

    const purchasePoints = purchasesData.map((purchase) => ({
      date: purchase.purchaseDate,
      price: purchase.pricePerShare,
    }));

    return {
      ...baseChartData,
      purchasePoints,
    };
  }, [baseChartData, purchasesData]);

  const isLoading = isLoadingPurchases || isLoadingPrice;
  const error = purchasesError || priceError;

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
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

  if (error) {
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

  if (isLoading) {
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
              {formatCurrency(stockData.currentPrice)}
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <StockStats stockData={stockData} />

      {/* Chart Section */}
      <StockChart
        data={
          chartData || {
            symbol: "",
            period: "",
            priceData: [],
            purchasePoints: [],
          }
        }
        height={400}
        isLoading={isLoadingChart}
        error={chartError}
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
      />

      {/* Purchase History */}
      <StockPurchaseHistory purchases={stockData.purchases} />
    </div>
  );
};

export default StockDetailsPage;
