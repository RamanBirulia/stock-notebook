import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface User {
  id: string;
  username: string;
  lastLogin?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

const getInitialToken = () => {
  try {
    return typeof window !== "undefined"
      ? localStorage.getItem("auth_token")
      : null;
  } catch {
    return null;
  }
};

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: getInitialToken(),
  isLoading: false,
  error: null,
};

// Check if there's a valid token in localStorage on initialization
const initializeAuth = () => {
  if (initialState.token) {
    try {
      // Basic token validation - check if it's not expired
      const payload = JSON.parse(atob(initialState.token.split(".")[1]));
      const currentTime = Date.now() / 1000;

      if (payload.exp > currentTime) {
        initialState.isAuthenticated = true;
        initialState.user = {
          id: payload.sub,
          username: payload.username,
          email: payload.email,
        };
      } else {
        // Token expired, clear it
        if (typeof window !== "undefined" && window.localStorage) {
          localStorage.removeItem("auth_token");
        }
        initialState.token = null;
      }
    } catch (error) {
      // Invalid token, clear it
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.removeItem("auth_token");
      }
      initialState.token = null;
    }
  }
};

// Only initialize if we're in a browser environment
if (typeof window !== "undefined") {
  initializeAuth();
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (
      state,
      action: PayloadAction<{ user: User; token: string }>,
    ) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;

      // Store token in localStorage
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem("auth_token", action.payload.token);
      }
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = action.payload;

      // Clear token from localStorage
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.removeItem("auth_token");
      }
    },
    registerStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    registerSuccess: (
      state,
      action: PayloadAction<{ user: User; token: string }>,
    ) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;

      // Store token in localStorage
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem("auth_token", action.payload.token);
      }
    },
    registerFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = action.payload;

      // Clear token from localStorage
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.removeItem("auth_token");
      }
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = null;
      state.isLoading = false;

      // Clear token from localStorage
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.removeItem("auth_token");
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    updateLastLogin: (state, action: PayloadAction<string>) => {
      if (state.user) {
        state.user.lastLogin = action.payload;
      }
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  registerStart,
  registerSuccess,
  registerFailure,
  logout,
  clearError,
  updateLastLogin,
} = authSlice.actions;

export default authSlice.reducer;

// Selectors
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  state.auth.isAuthenticated;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectAuthToken = (state: { auth: AuthState }) => state.auth.token;
export const selectAuthLoading = (state: { auth: AuthState }) =>
  state.auth.isLoading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
