import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Card } from "../ui/Card";
import { Button } from "../ui/Button";

interface Stock {
  symbol: string;
  quantity: number;
  current_price: number;
  total_value: number;
  total_spent: number;
}

interface PortfolioTableProps {
  stocks: Stock[];
}

export const PortfolioTable: React.FC<PortfolioTableProps> = ({ stocks }) => {
  const { t } = useTranslation();

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
          {t("dashboard.portfolio.title")}
        </h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {stocks.length} {t("dashboard.portfolio.stocks")}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="table">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th>{t("dashboard.table.symbol")}</th>
              <th className="text-right">{t("dashboard.table.quantity")}</th>
              <th className="text-right">
                {t("dashboard.table.currentPrice")}
              </th>
              <th className="text-right">{t("dashboard.table.totalValue")}</th>
              <th className="text-right">{t("dashboard.table.totalSpent")}</th>
              <th className="text-right">{t("dashboard.table.profitLoss")}</th>
              <th className="text-right">{t("dashboard.table.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {stocks.map((stock) => {
              const stockProfitLoss = stock.total_value - stock.total_spent;
              const isStockProfit = stockProfitLoss >= 0;

              return (
                <tr key={stock.symbol}>
                  <td>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {stock.symbol}
                    </div>
                  </td>
                  <td className="text-right">{stock.quantity.toFixed(0)}</td>
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
  );
};
