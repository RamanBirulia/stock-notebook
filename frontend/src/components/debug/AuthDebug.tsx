import React, { useState } from "react";
import { useAppSelector } from "../../store";
import { selectAuth } from "../../store/slices/authSlice";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";

export const AuthDebug: React.FC = () => {
  const auth = useAppSelector(selectAuth);
  const [apiTest, setApiTest] = useState<{
    status: "idle" | "loading" | "success" | "error";
    message: string;
  }>({ status: "idle", message: "" });

  const isDebugEnabled = localStorage.getItem("debug") === "true";

  const testApiConnection = async () => {
    setApiTest({ status: "loading", message: "Testing API connection..." });

    try {
      // Test backend connectivity
      const response = await fetch("/api/dashboard", {
        headers: {
          Authorization: auth.token ? `Bearer ${auth.token}` : "",
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setApiTest({
          status: "success",
          message: `API connection successful! Status: ${response.status}`,
        });
      } else {
        const errorText = await response.text();
        setApiTest({
          status: "error",
          message: `API error: ${response.status} - ${errorText}`,
        });
      }
    } catch (error) {
      setApiTest({
        status: "error",
        message: `Connection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    }
  };

  const testStockEndpoint = async () => {
    setApiTest({ status: "loading", message: "Testing stock endpoint..." });

    try {
      const response = await fetch("/api/stock/EPAM", {
        headers: {
          Authorization: auth.token ? `Bearer ${auth.token}` : "",
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setApiTest({
          status: "success",
          message: `Stock endpoint successful! Got data for ${data.symbol}`,
        });
      } else {
        const errorText = await response.text();
        setApiTest({
          status: "error",
          message: `Stock endpoint error: ${response.status} - ${errorText}`,
        });
      }
    } catch (error) {
      setApiTest({
        status: "error",
        message: `Stock endpoint failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    }
  };

  const testHealthEndpoint = async () => {
    setApiTest({ status: "loading", message: "Testing backend health..." });

    try {
      const response = await fetch("/health");

      if (response.ok) {
        const data = await response.json();
        setApiTest({
          status: "success",
          message: `Backend is healthy! Status: ${data.status} - ${data.message}`,
        });
      } else {
        const errorText = await response.text();
        setApiTest({
          status: "error",
          message: `Health check failed: ${response.status} - ${errorText}`,
        });
      }
    } catch (error) {
      setApiTest({
        status: "error",
        message: `Cannot reach backend: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    }
  };

  const decodeToken = (token: string) => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return {
        ...payload,
        exp_readable: new Date(payload.exp * 1000).toLocaleString(),
        is_expired: payload.exp < Date.now() / 1000,
      };
    } catch (error) {
      return { error: "Invalid token format" };
    }
  };

  if (isDebugEnabled) {
    return null;
  }

  return (
    <Card className="p-6 m-4">
      <h2 className="text-xl font-bold mb-4">Authentication Debug Panel</h2>

      {/* Auth State */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Authentication State</h3>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm">
          <p>
            <strong>Is Authenticated:</strong>{" "}
            {auth.isAuthenticated ? "✅ Yes" : "❌ No"}
          </p>
          <p>
            <strong>Has Token:</strong> {auth.token ? "✅ Yes" : "❌ No"}
          </p>
          <p>
            <strong>User:</strong>{" "}
            {auth.user ? `${auth.user.username} (${auth.user.id})` : "None"}
          </p>
          <p>
            <strong>Loading:</strong> {auth.isLoading ? "Yes" : "No"}
          </p>
          <p>
            <strong>Error:</strong> {auth.error || "None"}
          </p>
        </div>
      </div>

      {/* Token Details */}
      {auth.token && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Token Details</h3>
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm">
            {(() => {
              const decoded = decodeToken(auth.token);
              if (decoded.error) {
                return <p className="text-red-500">Error: {decoded.error}</p>;
              }
              return (
                <>
                  <p>
                    <strong>User ID:</strong> {decoded.user_id}
                  </p>
                  <p>
                    <strong>Username:</strong> {decoded.username}
                  </p>
                  <p>
                    <strong>Expires:</strong> {decoded.exp_readable}
                  </p>
                  <p>
                    <strong>Is Expired:</strong>{" "}
                    {decoded.is_expired ? "❌ Yes" : "✅ No"}
                  </p>
                  <p>
                    <strong>Token (first 50 chars):</strong>{" "}
                    {auth.token.substring(0, 50)}...
                  </p>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* LocalStorage Check */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">LocalStorage</h3>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm">
          <p>
            <strong>Stored Token:</strong>{" "}
            {localStorage.getItem("auth_token") ? "✅ Present" : "❌ Missing"}
          </p>
          <p>
            <strong>Matches State:</strong>{" "}
            {localStorage.getItem("auth_token") === auth.token
              ? "✅ Yes"
              : "❌ No"}
          </p>
        </div>
      </div>

      {/* API Tests */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">API Connection Tests</h3>
        <div className="flex gap-2 mb-4">
          <Button onClick={testHealthEndpoint} variant="secondary" size="sm">
            Test Backend Health
          </Button>
          <Button onClick={testApiConnection} variant="secondary" size="sm">
            Test Dashboard API
          </Button>
          <Button onClick={testStockEndpoint} variant="secondary" size="sm">
            Test Stock API (EPAM)
          </Button>
        </div>

        {apiTest.status !== "idle" && (
          <div
            className={`p-4 rounded-lg text-sm ${
              apiTest.status === "loading"
                ? "bg-blue-100 dark:bg-blue-900/20"
                : apiTest.status === "success"
                  ? "bg-green-100 dark:bg-green-900/20"
                  : "bg-red-100 dark:bg-red-900/20"
            }`}
          >
            <p
              className={
                apiTest.status === "loading"
                  ? "text-blue-700 dark:text-blue-300"
                  : apiTest.status === "success"
                    ? "text-green-700 dark:text-green-300"
                    : "text-red-700 dark:text-red-300"
              }
            >
              {apiTest.message}
            </p>
          </div>
        )}
      </div>

      {/* Environment Info */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Environment Info</h3>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm">
          <p>
            <strong>Current URL:</strong> {window.location.href}
          </p>
          <p>
            <strong>Origin:</strong> {window.location.origin}
          </p>
          <p>
            <strong>Proxy Target:</strong> http://localhost:8080 (from
            package.json)
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Quick Actions</h3>
        <div className="flex gap-2">
          <Button
            onClick={() => localStorage.removeItem("auth_token")}
            variant="secondary"
            size="sm"
          >
            Clear LocalStorage Token
          </Button>
          <Button
            onClick={() => window.location.reload()}
            variant="secondary"
            size="sm"
          >
            Reload Page
          </Button>
        </div>
      </div>
    </Card>
  );
};
