import React from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../store";
import { selectIsAuthenticated } from "../store/slices/authSlice";
import Login from "../components/auth/Login";
import { SEOHead, generateSEOConfig } from "../components/SEO";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleLoginSuccess = () => {
    navigate("/dashboard");
  };

  if (isAuthenticated) {
    return null; // Prevent flash before redirect
  }

  return (
    <>
      <SEOHead {...generateSEOConfig("LOGIN")} />
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Login onSuccess={handleLoginSuccess} />
        </div>
      </div>
    </>
  );
};

export default LoginPage;
