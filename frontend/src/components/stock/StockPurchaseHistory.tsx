import React from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";

import { Purchase } from "../../store/api/models";
import { Card } from "../ui/Card";

interface StockPurchaseHistoryProps {
  purchases: Purchase[];
}

export const StockPurchaseHistory: React.FC<StockPurchaseHistoryProps> = ({
  purchases,
}) => {
  const { t } = useTranslation();

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Format number with commas
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        {t("stock.details.purchaseHistory.title")}
      </h2>

      {purchases.length === 0 ? (
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
              {purchases.map((purchase) => {
                const totalCost =
                  purchase.quantity * purchase.pricePerShare +
                  purchase.commission;
                return (
                  <tr
                    key={purchase.id}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="py-3 px-4 text-gray-900 dark:text-white">
                      {format(
                        new Date(purchase.purchaseDate),
                        "MMM dd, yyyy",
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-900 dark:text-white">
                      {formatNumber(purchase.quantity)}
                    </td>
                    <td className="py-3 px-4 text-gray-900 dark:text-white">
                      {formatCurrency(purchase.pricePerShare)}
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
  );
};
