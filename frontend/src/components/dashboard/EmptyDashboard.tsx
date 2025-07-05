import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PieChart, Plus } from "lucide-react";

import { Card } from "../ui/Card";
import { Button } from "../ui/Button";

export const EmptyDashboard: React.FC = () => {
  const { t } = useTranslation();

  return (
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
  );
};
