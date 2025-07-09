import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff, LogIn, UserPlus } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  useLoginMutation,
  useRegisterMutation,
} from "../../store/api/stockApi";
import {
  loginStart,
  loginSuccess,
  loginFailure,
  registerStart,
  registerSuccess,
  registerFailure,
  clearError,
  selectAuthLoading,
  selectAuthError,
} from "../../store/slices/authSlice";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";

interface LoginProps {
  onSuccess?: () => void;
}

const Login: React.FC<LoginProps> = ({ onSuccess }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);

  const [loginMutation] = useLoginMutation();
  const [registerMutation] = useRegisterMutation();

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [validationErrors, setValidationErrors] = useState<{
    username?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  // Clear errors when switching modes
  useEffect(() => {
    dispatch(clearError());
    setValidationErrors({});
  }, [isLoginMode, dispatch]);

  const validateForm = () => {
    const errors: {
      username?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    if (!formData.username.trim()) {
      errors.username = t("auth.validation.usernameRequired");
    } else if (formData.username.length < 3) {
      errors.username = t("auth.validation.usernameMinLength");
    }

    if (!formData.password) {
      errors.password = t("auth.validation.passwordRequired");
    } else if (formData.password.length < 6) {
      errors.password = t("auth.validation.passwordMinLength");
    }

    if (!isLoginMode) {
      if (!formData.confirmPassword) {
        errors.confirmPassword = t("auth.validation.confirmPasswordRequired");
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = t("auth.validation.passwordMismatch");
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear validation error for this field
    if (validationErrors[name as keyof typeof validationErrors]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (isLoginMode) {
        dispatch(loginStart());
        const result = await loginMutation(formData).unwrap();
        dispatch(loginSuccess(result));
      } else {
        dispatch(registerStart());
        const result = await registerMutation(formData).unwrap();
        dispatch(registerSuccess(result));
      }

      onSuccess?.();
    } catch (error: any) {
      const errorMessage =
        error?.data?.error || error?.message || t("auth.error.generic");

      if (isLoginMode) {
        dispatch(loginFailure(errorMessage));
      } else {
        dispatch(registerFailure(errorMessage));
      }
    }
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setFormData({ username: "", password: "", confirmPassword: "" });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <div className="p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-full">
              {isLoginMode ? (
                <LogIn className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              ) : (
                <UserPlus className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              )}
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isLoginMode ? t("auth.login.title") : t("auth.register.title")}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {isLoginMode
              ? t("auth.login.subtitle")
              : t("auth.register.subtitle")}
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              label={t("auth.form.username")}
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              error={validationErrors.username}
              placeholder={t("auth.form.usernamePlaceholder")}
              disabled={isLoading}
              required
            />
          </div>

          <div className="relative">
            <Input
              label={t("auth.form.password")}
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              error={validationErrors.password}
              placeholder={t("auth.form.passwordPlaceholder")}
              disabled={isLoading}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              onClick={togglePasswordVisibility}
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>

          {!isLoginMode && (
            <div>
              <Input
                label={t("auth.form.confirmPassword")}
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                error={validationErrors.confirmPassword}
                placeholder={t("auth.form.confirmPasswordPlaceholder")}
                disabled={isLoading}
                required
              />
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={isLoading}
            leftIcon={
              isLoginMode ? (
                <LogIn className="h-4 w-4" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )
            }
          >
            {isLoading
              ? t("auth.form.loading")
              : isLoginMode
                ? t("auth.login.submit")
                : t("auth.register.submit")}
          </Button>
        </form>

        {/* Mode Toggle */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {isLoginMode
              ? t("auth.login.noAccount")
              : t("auth.register.hasAccount")}
          </p>
          <button
            type="button"
            onClick={toggleMode}
            className="mt-1 text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
            disabled={isLoading}
          >
            {isLoginMode ? t("auth.register.title") : t("auth.login.title")}
          </button>
        </div>
      </div>
    </Card>
  );
};

export default Login;
