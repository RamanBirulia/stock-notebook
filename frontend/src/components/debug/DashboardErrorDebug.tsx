import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BarChart3 } from "lucide-react";

import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { AuthDebug } from "./AuthDebug";

export const DashboardErrorDebug = () => {
  const { t } = useTranslation();
  const [showDebug, onToggleDebug] = useState(false);

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button
          onClick={() => onToggleDebug(!showDebug)}
          variant="secondary"
          size="sm"
          leftIcon={<BarChart3 className="w-4 h-4" />}
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
};
