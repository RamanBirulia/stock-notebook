import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { stockApi } from "./api/stockApi";
import themeReducer from "./slices/themeSlice";
import uiReducer from "./slices/uiSlice";
import authReducer from "./slices/authSlice";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

// Custom middleware for API error handling
const apiErrorHandlingMiddleware =
  (store: any) => (next: any) => (action: any) => {
    const result = next(action);

    // Handle RTK Query rejected actions
    if (action.type.endsWith("/rejected") && action.meta?.arg?.endpointName) {
      const error = action.payload;
      console.error(`API Error for ${action.meta.arg.endpointName}:`, error);

      // Dispatch UI notification for API errors
      store.dispatch({
        type: "ui/addNotification",
        payload: {
          type: "error",
          title: "API Error",
          message:
            error?.data?.error ||
            error?.message ||
            "An unexpected error occurred",
          duration: 5000,
        },
      });
    }

    return result;
  };

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    ui: uiReducer,
    auth: authReducer,
    [stockApi.reducerPath]: stockApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "persist/PERSIST",
          "persist/REHYDRATE",
          // Ignore RTK Query internal actions
          "api/queries/fulfilled",
          "api/queries/pending",
          "api/queries/rejected",
        ],
        ignoredPaths: ["api.queries"],
        warnAfter: 64,
      },
      // Enable additional checks in development
      thunk: {
        extraArgument: undefined,
      },
      immutableCheck: {
        warnAfter: 64,
      },
    })
      .concat(stockApi.middleware)
      .concat(apiErrorHandlingMiddleware),

  // Enable Redux DevTools in development
  devTools: process.env.NODE_ENV !== "production",
});

// Enable automatic refetching when network connectivity is restored
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks for Redux
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Helper function to get store state (useful for utilities outside React components)
export const getStoreState = () => store.getState();

// Helper function to dispatch actions outside React components
export const dispatchAction = (action: any) => store.dispatch(action);

// Export store instance for testing and utilities
export default store;

// Re-export custom hooks for convenience
export * from "./hooks";
