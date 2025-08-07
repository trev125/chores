import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type { Person, Chore, Reward, ActivityLog } from "../types";
import { apiClient } from "../utils/api";
import { useAuth } from "./AuthContext";

interface DataContextType {
  persons: Person[];
  chores: Chore[];
  rewards: Reward[];
  activities: ActivityLog[];
  pendingRedemptions: Reward[];
  loading: boolean;
  error: string | null;
  clearError: () => void;
  refreshData: () => Promise<void>;
  addPerson: (data: any) => Promise<void>;
  updatePerson: (id: number, data: any) => Promise<void>;
  deletePerson: (id: number) => Promise<void>;
  addChore: (data: any) => Promise<void>;
  completeChore: (id: number) => Promise<void>;
  deleteChore: (id: number) => Promise<void>;
  addReward: (data: any) => Promise<void>;
  completeReward: (id: number) => Promise<void>;
  fulfillReward: (id: number) => Promise<void>;
  deleteReward: (id: number) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};

interface DataProviderProps {
  children: React.ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [persons, setPersons] = useState<Person[]>([]);
  const [chores, setChores] = useState<Chore[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [pendingRedemptions, setPendingRedemptions] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isAuthenticated, user } = useAuth();

  /**
   * Centralised helper for API requests that automatically
   * manages the `loading` / `error` flags and logs failures.
   */
  const handleRequest = useCallback(
    async <T,>(fn: () => Promise<T>): Promise<T> => {
      setLoading(true);
      setError(null);
      try {
        return await fn();
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Unexpected error occurred";
        // eslint-disable-next-line no-console
        console.error("[DataContext] API request failed:", err);
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clearError = () => setError(null);

  const refreshData = useCallback(async () => {
    if (!isAuthenticated) return;

    await handleRequest(async () => {
      const [personsData, choresData, rewardsData, activitiesData] =
        await Promise.all([
          apiClient.getPersons(),
          apiClient.getChores(),
          apiClient.getRewards(),
          apiClient.getActivities({ limit: 20 }),
        ]);
      setPersons(personsData);
      setChores(choresData);
      setRewards(rewardsData);
      setActivities(activitiesData);

      // Fetch pending redemptions if user is admin
      if (user?.is_admin) {
        try {
          const pendingData = await apiClient.getPendingRedemptions();
          setPendingRedemptions(pendingData);
        } catch (err) {
          // Not an admin or other error, set empty array
          setPendingRedemptions([]);
        }
      } else {
        setPendingRedemptions([]);
      }
    });
  }, [isAuthenticated, user?.is_admin, handleRequest]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const addPerson = async (data: any) => {
    await handleRequest(async () => {
      await apiClient.createPerson(data);
      await refreshData();
    });
  };

  const updatePerson = async (id: number, data: any) => {
    await handleRequest(async () => {
      await apiClient.updatePerson(id, data);
      await refreshData();
    });
  };

  const deletePerson = async (id: number) => {
    await handleRequest(async () => {
      await apiClient.deletePerson(id);
      await refreshData();
    });
  };

  const addChore = async (data: any) => {
    await handleRequest(async () => {
      await apiClient.createChore(data);
      await refreshData();
    });
  };

  const completeChore = async (id: number) => {
    await handleRequest(async () => {
      await apiClient.completeChore(id);
      await refreshData();
    });
  };

  const deleteChore = async (id: number) => {
    await handleRequest(async () => {
      await apiClient.deleteChore(id);
      await refreshData();
    });
  };

  const addReward = async (data: any) => {
    await handleRequest(async () => {
      await apiClient.createReward(data);
      await refreshData();
    });
  };

  const completeReward = async (id: number) => {
    await handleRequest(async () => {
      await apiClient.completeReward(id);
      await refreshData();
    });
  };

  const fulfillReward = async (id: number) => {
    await handleRequest(async () => {
      await apiClient.fulfillReward(id);
      await refreshData();
    });
  };

  const deleteReward = async (id: number) => {
    await handleRequest(async () => {
      await apiClient.deleteReward(id);
      await refreshData();
    });
  };

  const value: DataContextType = {
    persons,
    chores,
    rewards,
    activities,
    pendingRedemptions,
    loading,
    error,
    clearError,
    refreshData,
    addPerson,
    updatePerson,
    deletePerson,
    addChore,
    completeChore,
    deleteChore,
    addReward,
    completeReward,
    fulfillReward,
    deleteReward,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
