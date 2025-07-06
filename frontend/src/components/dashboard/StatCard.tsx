import React from "react";
import { LucideIcon } from "lucide-react";

import { Card } from "../ui/Card";

interface StatCardProps {
  icon: LucideIcon;
  iconColor: string;
  title: string;
  value: string;
  valueColor?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  iconColor,
  title,
  value,
  valueColor = "text-gray-900 dark:text-white",
  className = "",
}) => {
  return (
    <Card className={`${className} @container/card`}>
      <div className="flex items-center flex-row @sm/card:flex-col @md/card:flex-row">
        <div className="shrink-0">
          <Icon
            className={`h-4 w-4 @3xs/card:h-8 @3xs/card:w-8 ${iconColor}`}
          />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </p>
          <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
        </div>
      </div>
    </Card>
  );
};
