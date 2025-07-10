import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ScatterController,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { format, parseISO } from "date-fns";

import { ChartData, ChartPeriod } from "../../store/api/models";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ScatterController,
);

interface StockChartProps {
  data: ChartData;
  height?: number;
  isLoading?: boolean;
  error?: any;
  selectedPeriod: ChartPeriod;
  onPeriodChange: (period: ChartPeriod) => void;
}

export const StockChart: React.FC<StockChartProps> = ({
  data,
  height = 400,
  isLoading = false,
  error = null,
  selectedPeriod,
  onPeriodChange,
}) => {
  const { t } = useTranslation();

  // Helper function to safely parse dates
  const parseDate = (dateString: string): Date => {
    // Handle different date formats
    if (dateString.includes("T")) {
      // ISO format: 2023-07-10T00:00:00Z
      return parseISO(dateString);
    } else if (dateString.includes("-")) {
      // Simple date format: 2023-07-10
      return parseISO(dateString + "T00:00:00Z");
    } else {
      // Fallback to regular Date parsing
      return new Date(dateString);
    }
  };

  // Helper function to format date consistently
  const formatDateForChart = (date: Date): string => {
    return format(date, "yyyy-MM-dd");
  };

  const chartData = useMemo(() => {
    if (!data || !data.priceData) return null;

    // Sort and process price data
    const sortedPriceData = [...data.priceData].sort((a, b) => {
      const dateA = parseDate(a.date);
      const dateB = parseDate(b.date);
      return dateA.getTime() - dateB.getTime();
    });

    const labels = sortedPriceData.map((point) =>
      formatDateForChart(parseDate(point.date)),
    );
    const prices = sortedPriceData.map((point) => point.price);

    // Process purchase points with better date matching
    const purchaseDataPoints: (number | null)[] = new Array(labels.length).fill(
      null,
    );

    if (data.purchasePoints && data.purchasePoints.length > 0) {
      data.purchasePoints.forEach((purchase) => {
        const purchaseDate = formatDateForChart(parseDate(purchase.date));
        const matchingIndex = labels.findIndex(
          (label) => label === purchaseDate,
        );

        if (matchingIndex !== -1) {
          purchaseDataPoints[matchingIndex] = purchase.price;
        } else {
          // If exact match not found, find closest date
          const purchaseDateObj = parseDate(purchase.date);
          let closestIndex = -1;
          let minDiff = Infinity;

          labels.forEach((label, index) => {
            const labelDate = parseDate(label);
            const diff = Math.abs(
              labelDate.getTime() - purchaseDateObj.getTime(),
            );
            if (diff < minDiff) {
              minDiff = diff;
              closestIndex = index;
            }
          });

          if (closestIndex !== -1 && minDiff < 7 * 24 * 60 * 60 * 1000) {
            // Within 7 days
            purchaseDataPoints[closestIndex] = purchase.price;
          }
        }
      });
    }

    return {
      labels,
      datasets: [
        {
          label: t("chart.stockPrice"),
          data: prices,
          borderColor: "rgb(59, 130, 246)",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          borderWidth: 2,
          pointRadius: 1,
          pointHoverRadius: 4,
          fill: true,
          tension: 0.1,
        },
        {
          label: t("chart.purchases"),
          data: purchaseDataPoints,
          borderColor: "rgb(239, 68, 68)",
          backgroundColor: "rgb(239, 68, 68)",
          pointRadius: 6,
          pointHoverRadius: 8,
          pointBackgroundColor: "rgb(239, 68, 68)",
          pointBorderColor: "rgb(239, 68, 68)",
          pointBorderWidth: 2,
          showLine: false,
        },
      ],
    } as any;
  }, [data, t]);

  const options = useMemo(() => {
    if (!data || !data.priceData) return {};

    const prices = data.priceData.map((p) => p.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const padding = (maxPrice - minPrice) * 0.1;

    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top" as const,
          labels: {
            color: "rgb(107, 114, 128)",
            usePointStyle: true,
            filter: (legendItem: any) => {
              // Only show legend items that have data
              return (
                legendItem.datasetIndex === 0 ||
                (data.purchasePoints && data.purchasePoints.length > 0)
              );
            },
          },
        },
        title: {
          display: true,
          text: `${data.symbol} - ${selectedPeriod}`,
          color: "rgb(107, 114, 128)",
          font: {
            size: 16,
            weight: "bold" as const,
          },
        },
        tooltip: {
          mode: "index" as const,
          intersect: false,
          backgroundColor: "rgba(17, 24, 39, 0.9)",
          titleColor: "rgb(243, 244, 246)",
          bodyColor: "rgb(243, 244, 246)",
          borderColor: "rgb(75, 85, 99)",
          borderWidth: 1,
          callbacks: {
            title: (context: any) => {
              const label = context[0]?.label;
              if (label) {
                try {
                  const date = parseDate(label);
                  return format(date, "MMM dd, yyyy");
                } catch {
                  return label;
                }
              }
              return "";
            },
            label: (context: any) => {
              const datasetLabel = context.dataset.label;
              const value = context.parsed.y;

              if (value === null || value === undefined) return;

              if (datasetLabel === t("chart.purchases")) {
                return `${datasetLabel}: $${value.toFixed(2)} (Purchase)`;
              }
              return `${datasetLabel}: $${value.toFixed(2)}`;
            },
          },
          filter: (tooltipItem: any) => {
            // Don't show tooltip for null values
            return tooltipItem.parsed.y !== null;
          },
        },
      },
      interaction: {
        mode: "nearest" as const,
        axis: "x" as const,
        intersect: false,
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: t("chart.date"),
            color: "rgb(107, 114, 128)",
          },
          grid: {
            color: "rgba(107, 114, 128, 0.1)",
          },
          ticks: {
            color: "rgb(107, 114, 128)",
            maxTicksLimit: 8,
            callback: function (value: any, _index: number): string {
              const label = (this as any).getLabelForValue(value);
              try {
                const date = parseDate(label);
                return format(date, "MMM dd");
              } catch {
                return label;
              }
            },
          },
        },
        y: {
          display: true,
          title: {
            display: true,
            text: t("chart.price"),
            color: "rgb(107, 114, 128)",
          },
          grid: {
            color: "rgba(107, 114, 128, 0.1)",
          },
          ticks: {
            color: "rgb(107, 114, 128)",
            callback: function (value: any) {
              return `$${value.toFixed(2)}`;
            },
          },
          min: minPrice - padding,
          max: maxPrice + padding,
        },
      },
    };
  }, [data, t, selectedPeriod]);

  const periods: ChartPeriod[] = ["1M", "1Y", "5Y"];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {t("stock.details.chart.title")}
        </h2>
        <div className="flex gap-2">
          {periods.map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? "primary" : "secondary"}
              size="sm"
              onClick={() => onPeriodChange(period)}
            >
              {period}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="h-96 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"></div>
      ) : error ? (
        <div className="h-96 flex items-center justify-center text-gray-500 dark:text-gray-400">
          {t("stock.details.errors.chartError")}
        </div>
      ) : chartData ? (
        <div style={{ height: `${height}px` }} className="w-full">
          <Line data={chartData} options={options} />
        </div>
      ) : (
        <div className="h-96 flex items-center justify-center text-gray-500 dark:text-gray-400">
          {t("stock.details.errors.chartError")}
        </div>
      )}
    </Card>
  );
};
