import React, { useMemo } from "react";
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
import { useTranslation } from "react-i18next";
import { format, parseISO } from "date-fns";

import { ChartData } from "../../store/api/models";

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
}

export const StockChart: React.FC<StockChartProps> = ({
  data,
  height = 400,
}) => {
  const { t } = useTranslation();

  const chartData = useMemo(() => {
    const sortedPriceData = [...data.priceData].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    const labels = sortedPriceData.map((point) => point.date);
    const prices = sortedPriceData.map((point) => point.price);

    // Create purchase points for overlay
    const purchaseLabels: string[] = [];
    const purchasePrices: number[] = [];

    data.purchasePoints.forEach((purchase) => {
      const dateIndex = labels.findIndex((label) => label === purchase.date);
      if (dateIndex !== -1) {
        purchaseLabels.push(purchase.date);
        purchasePrices.push(purchase.price);
      }
    });

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
          data: data.purchasePoints.map((purchase) => purchase.price),
          borderColor: "rgb(239, 68, 68)",
          backgroundColor: "rgb(239, 68, 68)",
          pointRadius: 6,
          pointHoverRadius: 8,
          pointBackgroundColor: "rgb(239, 68, 68)",
          pointBorderColor: "rgb(239, 68, 68)",
        },
      ],
    } as any;
  }, [data, t]);

  const options = useMemo(() => {
    const minPrice = Math.min(...data.priceData.map((p) => p.price));
    const maxPrice = Math.max(...data.priceData.map((p) => p.price));
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
          },
        },
        title: {
          display: true,
          text: `${data.symbol} - ${data.period}`,
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
              const date = context[0]?.label;
              if (date) {
                try {
                  return format(parseISO(date), "MMM dd, yyyy");
                } catch {
                  return date;
                }
              }
              return "";
            },
            label: (context: any) => {
              const datasetLabel = context.dataset.label;
              const value = context.parsed.y;
              if (datasetLabel === t("chart.purchases")) {
                return `${datasetLabel}: $${value.toFixed(2)} (Purchase)`;
              }
              return `${datasetLabel}: $${value.toFixed(2)}`;
            },
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
              const date = (this as any).getLabelForValue(value);
              try {
                return format(parseISO(date), "MMM dd");
              } catch {
                return date;
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
  }, [data, t]);

  return (
    <div style={{ height: `${height}px` }} className="w-full">
      <Line data={chartData} options={options} />
    </div>
  );
};
