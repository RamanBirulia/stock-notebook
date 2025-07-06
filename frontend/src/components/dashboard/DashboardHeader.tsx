import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";

import { Button } from "../ui/Button";

export const DashboardHeader: React.FC<{hideControls?: boolean}> = ({hideControls}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t("dashboard.title")}
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {t("dashboard.subtitle")}
        </p>
      </div>
      {!hideControls && (
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
      )}
    </div>
  );
};
