import React from "react";
import { LucideIcon } from "lucide-react";

import { Card } from "../ui/Card";

interface StatCardProps {
  icon: LucideIcon;
  iconColor: string;
  title: string;
  value: string;
  valueColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  iconColor,
  title,
  value,
  valueColor = "text-gray-900 dark:text-white",
}) => {
  return (
    <Card>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <Icon className={`h-8 w-8 ${iconColor}`} />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </p>
          <p className={`text-2xl font-bold ${valueColor}`}>
            {value}
          </p>
        </div>
      </div>
    </Card>
  );
};
