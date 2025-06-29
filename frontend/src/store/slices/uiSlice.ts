import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  timestamp: number;
}

export interface Modal {
  id: string;
  type: 'confirmation' | 'form' | 'info';
  title: string;
  content?: string;
  data?: any;
}

interface UiState {
  // Loading states
  isLoading: boolean;
  loadingMessage?: string;
  
  // Notifications
  notifications: Notification[];
  
  // Modal management
  activeModal?: Modal;
  
  // Sidebar state
  sidebarOpen: boolean;
  
  // Mobile responsiveness
  isMobile: boolean;
  
  // Error states
  globalError?: {
    message: string;
    details?: string;
  };
}

const initialState: UiState = {
  isLoading: false,
  notifications: [],
  sidebarOpen: false,
  isMobile: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Loading state management
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
      if (!action.payload) {
        state.loadingMessage = undefined;
      }
    },
    
    setLoadingMessage: (state, action: PayloadAction<string>) => {
      state.loadingMessage = action.payload;
      state.isLoading = true;
    },
    
    // Notification management
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp'>>) => {
      const notification: Notification = {
        ...action.payload,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        duration: action.payload.duration || 5000,
      };
      state.notifications.push(notification);
    },
    
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    },
    
    clearNotifications: (state) => {
      state.notifications = [];
    },
    
    // Modal management
    openModal: (state, action: PayloadAction<Modal>) => {
      state.activeModal = action.payload;
    },
    
    closeModal: (state) => {
      state.activeModal = undefined;
    },
    
    // Sidebar management
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    
    // Mobile state
    setMobile: (state, action: PayloadAction<boolean>) => {
      state.isMobile = action.payload;
      // Auto-close sidebar on mobile when switching to mobile view
      if (action.payload) {
        state.sidebarOpen = false;
      }
    },
    
    // Global error management
    setGlobalError: (state, action: PayloadAction<{ message: string; details?: string }>) => {
      state.globalError = action.payload;
    },
    
    clearGlobalError: (state) => {
      state.globalError = undefined;
    },
  },
});

export const {
  setLoading,
  setLoadingMessage,
  addNotification,
  removeNotification,
  clearNotifications,
  openModal,
  closeModal,
  toggleSidebar,
  setSidebarOpen,
  setMobile,
  setGlobalError,
  clearGlobalError,
} = uiSlice.actions;

export default uiSlice.reducer;

// Selector helpers
export const selectNotifications = (state: { ui: UiState }) => state.ui.notifications;
export const selectIsLoading = (state: { ui: UiState }) => state.ui.isLoading;
export const selectLoadingMessage = (state: { ui: UiState }) => state.ui.loadingMessage;
export const selectActiveModal = (state: { ui: UiState }) => state.ui.activeModal;
export const selectSidebarOpen = (state: { ui: UiState }) => state.ui.sidebarOpen;
export const selectIsMobile = (state: { ui: UiState }) => state.ui.isMobile;
export const selectGlobalError = (state: { ui: UiState }) => state.ui.globalError;