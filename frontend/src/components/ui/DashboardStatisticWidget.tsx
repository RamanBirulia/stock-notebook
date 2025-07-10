import React from "react";
import { LucideIcon } from "lucide-react";
import { Card } from "./Card";

interface DashboardStatisticWidgetProps {
  id: string | number;
  name: string;
  value: string;
  icon: LucideIcon;
  iconColor?: string;
  valueColor?: string;
  layout?: "horizontal" | "vertical";
  className?: string;
}

export const DashboardStatisticWidget: React.FC<DashboardStatisticWidgetProps> = ({
  id,
  name,
  value,
  icon: Icon,
  iconColor = "text-primary-600",
  valueColor = "text-gray-900 dark:text-white",
  layout = "horizontal",
  className = "",
}) => {
  if (layout === "vertical") {
    return (
      <Card key={id} className={className}>
        <div className="text-center">
          <div className="flex justify-center mb-2">
            <Icon className={`h-8 w-8 ${iconColor}`} />
          </div>
          <dd className={`text-3xl font-semibold tracking-tight ${valueColor}`}>
            {value}
          </dd>
          <dt className="text-sm/6 font-semibold text-gray-600 dark:text-gray-400 mt-1">
            {name}
          </dt>
        </div>
      </Card>
    );
  }

  return (
    <Card key={id} className={className}>
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{name}</p>
          <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
        </div>
      </div>
    </Card>
  );
};
