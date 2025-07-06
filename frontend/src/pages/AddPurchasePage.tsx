import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Plus, ArrowLeft } from "lucide-react";
import { format } from "date-fns";

import StockSymbolInput from "../components/ui/StockSymbolInput";
import { useCreatePurchaseMutation } from "../store/api/stockApi";
import type { SymbolSuggestion } from "../store/api/models";

import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

interface FormData {
  symbol: string;
  quantity: string;
  price_per_share: string;
  commission: string;
  purchase_date: string;
}

interface FormErrors {
  symbol?: string;
  quantity?: string;
  price_per_share?: string;
  commission?: string;
  purchase_date?: string;
  submit?: string;
}

const AddPurchasePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [createPurchase, { isLoading }] = useCreatePurchaseMutation();

  const [formData, setFormData] = useState<FormData>({
    symbol: "",
    quantity: "",
    price_per_share: "",
    commission: "0",
    purchase_date: format(new Date(), "yyyy-MM-dd"),
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.symbol.trim()) {
      newErrors.symbol = t("addPurchase.errors.symbolRequired");
    } else if (!/^[A-Z]{1,10}$/.test(formData.symbol.toUpperCase())) {
      newErrors.symbol = t("addPurchase.errors.symbolInvalid");
    }

    if (!formData.quantity.trim()) {
      newErrors.quantity = t("addPurchase.errors.quantityRequired");
    } else {
      const quantity = parseInt(formData.quantity);
      if (isNaN(quantity) || quantity <= 0) {
        newErrors.quantity = t("addPurchase.errors.quantityInvalid");
      }
    }

    if (!formData.price_per_share.trim()) {
      newErrors.price_per_share = t("addPurchase.errors.priceRequired");
    } else {
      const price = parseFloat(formData.price_per_share);
      if (isNaN(price) || price <= 0) {
        newErrors.price_per_share = t("addPurchase.errors.priceInvalid");
      }
    }

    const commission = parseFloat(formData.commission);
    if (isNaN(commission) || commission < 0) {
      newErrors.commission = t("addPurchase.errors.commissionInvalid");
    }

    if (!formData.purchase_date) {
      newErrors.purchase_date = t("addPurchase.errors.dateRequired");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await createPurchase({
        symbol: formData.symbol.toUpperCase(),
        quantity: parseInt(formData.quantity),
        price_per_share: parseFloat(formData.price_per_share),
        commission: parseFloat(formData.commission),
        purchase_date: formData.purchase_date,
      }).unwrap();

      navigate("/", {
        state: {
          message: t("addPurchase.success", {
            symbol: formData.symbol.toUpperCase(),
          }),
        },
      });
    } catch (error: any) {
      setErrors({
        submit: error?.data?.error || t("addPurchase.errors.submitFailed"),
      });
    }
  };

  const handleInputChange =
    (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));

      // Clear field error when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({
          ...prev,
          [field]: undefined,
        }));
      }
    };

  return (
    <div>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            leftIcon={<ArrowLeft size={16} />}
          >
            {t("common.back")}
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t("addPurchase.title")}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {t("addPurchase.subtitle")}
            </p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Submit Error */}
            {errors.submit && (
              <div className="rounded-md bg-danger-50 dark:bg-danger-900/20 p-4">
                <div className="text-sm text-danger-700 dark:text-danger-400">
                  {errors.submit}
                </div>
              </div>
            )}

            {/* Stock Symbol */}
            <StockSymbolInput
              label={t("addPurchase.fields.symbol")}
              placeholder={t("addPurchase.placeholders.symbol")}
              value={formData.symbol}
              onChange={(value) =>
                handleInputChange("symbol")({
                  target: { value },
                } as React.ChangeEvent<HTMLInputElement>)
              }
              error={errors.symbol}
              required
              helperText={t("stockSymbolInput.placeholder")}
              onSymbolSelect={(symbol: SymbolSuggestion) => {
                setFormData((prev) => ({
                  ...prev,
                  symbol: symbol.symbol,
                }));
                // Clear symbol error when a valid symbol is selected
                if (errors.symbol) {
                  setErrors((prev) => ({
                    ...prev,
                    symbol: undefined,
                  }));
                }
              }}
            />

            {/* Quantity */}
            <Input
              label={t("addPurchase.fields.quantity")}
              type="number"
              min="1"
              step="1"
              placeholder={t("addPurchase.placeholders.quantity")}
              value={formData.quantity}
              onChange={handleInputChange("quantity")}
              error={errors.quantity}
              required
            />

            {/* Price per Share */}
            <Input
              label={t("addPurchase.fields.pricePerShare")}
              type="number"
              min="0"
              step="0.01"
              placeholder={t("addPurchase.placeholders.pricePerShare")}
              value={formData.price_per_share}
              onChange={handleInputChange("price_per_share")}
              error={errors.price_per_share}
              leftIcon={<span className="text-sm">$</span>}
              required
            />

            {/* Commission */}
            <Input
              label={t("addPurchase.fields.commission")}
              type="number"
              min="0"
              step="0.01"
              placeholder={t("addPurchase.placeholders.commission")}
              value={formData.commission}
              onChange={handleInputChange("commission")}
              error={errors.commission}
              helperText={t("addPurchase.helpers.commission")}
              leftIcon={<span className="text-sm">$</span>}
            />

            {/* Purchase Date */}
            <Input
              label={t("addPurchase.fields.purchaseDate")}
              type="date"
              value={formData.purchase_date}
              onChange={handleInputChange("purchase_date")}
              error={errors.purchase_date}
              required
            />

            {/* Summary */}
            {formData.quantity && formData.price_per_share && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  {t("addPurchase.summary.title")}
                </h3>
                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex justify-between">
                    <span>{t("addPurchase.summary.shares")}:</span>
                    <span>
                      {formData.quantity} × ${formData.price_per_share}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("addPurchase.summary.subtotal")}:</span>
                    <span>
                      $
                      {(
                        parseFloat(formData.quantity || "0") *
                        parseFloat(formData.price_per_share || "0")
                      ).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("addPurchase.summary.commission")}:</span>
                    <span>
                      ${parseFloat(formData.commission || "0").toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between font-medium text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-700 pt-1 mt-1">
                    <span>{t("addPurchase.summary.total")}:</span>
                    <span>
                      $
                      {(
                        parseFloat(formData.quantity || "0") *
                          parseFloat(formData.price_per_share || "0") +
                        parseFloat(formData.commission || "0")
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex space-x-3">
              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                leftIcon={<Plus size={16} />}
                className="flex-1"
              >
                {t("addPurchase.submit")}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate("/")}
                disabled={isLoading}
              >
                {t("common.cancel")}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default AddPurchasePage;
