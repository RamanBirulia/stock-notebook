import React from "react";
import { Link, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  const handleRowClick = (symbol: string) => {
    navigate(`/stock/${symbol}`);
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
          {t("dashboard.portfolio.title")}
        </h2>
        <span className="text-sm md:text-md text-gray-500 dark:text-gray-400">
          {stocks.length} {t("dashboard.portfolio.stocks")}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="table">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th>
                <span className="hidden sm:inline">
                  {t("dashboard.table.symbol")}
                </span>
                <span className="sm:hidden">📊</span>
              </th>
              <th className="text-right">
                <span className="hidden sm:inline">
                  {t("dashboard.table.quantity")}
                </span>
                <span className="sm:hidden">#</span>
              </th>
              <th className="text-right">
                <span className="hidden sm:inline">
                  {t("dashboard.table.currentPrice")}
                </span>
                <span className="sm:hidden">💰</span>
              </th>
              <th className="text-right">
                <span className="hidden sm:inline">
                  {t("dashboard.table.totalValue")}
                </span>
                <span className="sm:hidden">📈</span>
              </th>
              <th className="text-right hidden md:table-cell">
                <span className="hidden sm:inline">
                  {t("dashboard.table.totalSpent")}
                </span>
                <span className="sm:hidden">💸</span>
              </th>
              <th className="text-right">
                <span className="hidden sm:inline">
                  {t("dashboard.table.profitLoss")}
                </span>
                <span className="sm:hidden">📊</span>
              </th>
              <th className="text-right hidden lg:table-cell">
                {t("dashboard.table.actions")}
              </th>
            </tr>
          </thead>
          <tbody>
            {stocks.map((stock) => {
              const stockProfitLoss = stock.total_value - stock.total_spent;
              const isStockProfit = stockProfitLoss >= 0;

              return (
                <tr
                  key={stock.symbol}
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 md:cursor-auto"
                  onClick={() => handleRowClick(stock.symbol)}
                >
                  <td>
                    <div className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                      {stock.symbol}
                    </div>
                  </td>
                  <td className="text-right text-sm sm:text-base px-2 sm:px-4">
                    {stock.quantity.toFixed(0)}
                  </td>
                  <td className="text-right text-sm sm:text-base px-2 sm:px-4">
                    ${stock.current_price.toFixed(2)}
                  </td>
                  <td className="text-right font-medium text-sm sm:text-base px-2 sm:px-4">
                    ${stock.total_value.toFixed(2)}
                  </td>
                  <td className="text-right text-sm sm:text-base px-2 sm:px-4 hidden md:table-cell">
                    ${stock.total_spent.toFixed(2)}
                  </td>
                  <td
                    className={`text-right font-medium text-sm sm:text-base px-2 sm:px-4 ${
                      isStockProfit ? "text-success-600" : "text-danger-600"
                    }`}
                  >
                    {isStockProfit ? "+" : ""}${stockProfitLoss.toFixed(2)}
                  </td>
                  <td className="text-right hidden lg:table-cell">
                    <Button
                      as={Link}
                      to={`/stock/${stock.symbol}`}
                      variant="ghost"
                      size="sm"
                      onClick={(e) => e.stopPropagation()}
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
