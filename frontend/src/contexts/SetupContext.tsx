import React, { createContext, useContext, useState, useEffect } from "react";
import { apiClient } from "../utils/api";

interface SetupContextType {
  setupNeeded: boolean;
  loading: boolean;
  checkSetupStatus: () => Promise<void>;
  completeSetup: () => void;
}

const SetupContext = createContext<SetupContextType | undefined>(undefined);

export const useSetup = () => {
  const context = useContext(SetupContext);
  if (context === undefined) {
    throw new Error("useSetup must be used within a SetupProvider");
  }
  return context;
};

interface SetupProviderProps {
  children: React.ReactNode;
}

export const SetupProvider: React.FC<SetupProviderProps> = ({ children }) => {
  const [setupNeeded, setSetupNeeded] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkSetupStatus = async () => {
    try {
      setLoading(true);

      // First check if we have local auth data indicating setup was completed
      const token = localStorage.getItem("auth_token");
      const userData = localStorage.getItem("user_data");

      if (token && userData) {
        // If we have auth data, assume setup is complete
        // Even if the API call fails, we don't want to reset to setup wizard
        try {
          const response = await apiClient.getSetupStatus();
          setSetupNeeded(response.setupNeeded);
        } catch (error) {
          console.error(
            "Failed to check setup status, but auth data exists:",
            error
          );
          // Don't assume setup is needed if we have auth data
          setSetupNeeded(false);
        }
      } else {
        // No auth data, so we need to check the API
        const response = await apiClient.getSetupStatus();
        setSetupNeeded(response.setupNeeded);
      }
    } catch (error) {
      console.error("Failed to check setup status:", error);
      // Only assume setup is needed if we have no local auth data
      const hasAuthData =
        localStorage.getItem("auth_token") && localStorage.getItem("user_data");
      setSetupNeeded(!hasAuthData);
    } finally {
      setLoading(false);
    }
  };

  const completeSetup = () => {
    setSetupNeeded(false);
  };

  useEffect(() => {
    checkSetupStatus();
  }, []);

  const value: SetupContextType = {
    setupNeeded,
    loading,
    checkSetupStatus,
    completeSetup,
  };

  return (
    <SetupContext.Provider value={value}>{children}</SetupContext.Provider>
  );
};
