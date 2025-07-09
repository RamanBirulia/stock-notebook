import { fakeDashboardData } from "./data/landingData";
import { DashboardHeader } from "../dashboard/DashboardHeader";
import { DashboardStats } from "../dashboard/DashboardStats";
import { PortfolioTable } from "../dashboard/PortfolioTable";

export const LandingDashboard = () => {
  return (
    <div className="space-y-6 @container">
      <DashboardHeader hideControls />
      <DashboardStats dashboardData={fakeDashboardData} />
      <PortfolioTable stocks={fakeDashboardData.positions} />
    </div>
  );
};
