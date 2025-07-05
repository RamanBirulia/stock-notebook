import React from "react";

import { useGetDashboardQuery } from "../store/api/stockApi";

import { SEOHead, generateSEOConfig } from "../components/SEO";
import { SkeletonDashboard } from "../components/ui/loading/Skeleton";
import { DashboardErrorDebug } from "../components/debug/DashboardErrorDebug";
import { DashboardHeader } from "../components/dashboard/DashboardHeader";
import { DashboardStats } from "../components/dashboard/DashboardStats";
import { PortfolioTable } from "../components/dashboard/PortfolioTable";
import { EmptyDashboard } from "../components/dashboard/EmptyDashboard";

const DashboardPage: React.FC = () => {
  const { data: dashboardData, isLoading, error } = useGetDashboardQuery();

  const hasDashboardItems =
    dashboardData && (dashboardData?.stocks.length || 0) > 0;
  const isDashboardReady = !isLoading && !error;

  return (
    <>
      <SEOHead {...generateSEOConfig("DASHBOARD")} />

      {isLoading && <SkeletonDashboard />}
      {error && <DashboardErrorDebug />}
      {isDashboardReady && !hasDashboardItems && <EmptyDashboard />}

      {dashboardData && isDashboardReady && hasDashboardItems && (
        <div className="space-y-6">
          <DashboardHeader />
          <DashboardStats dashboardData={dashboardData} />
          <PortfolioTable stocks={dashboardData.stocks} />
        </div>
      )}
    </>
  );
};

export default DashboardPage;
