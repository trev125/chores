const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001/api";

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem("auth_token");
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem("auth_token", token);
    } else {
      localStorage.removeItem("auth_token");
    }
  }

  private async request(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ error: "Request failed" }));
        throw new Error(error.error || "Request failed");
      }

      return await response.json();
    } catch (error) {
      console.error("API Request failed:", error);
      throw error;
    }
  }

  // Auth endpoints
  async login(pin: string) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ pin }),
    });
  }

  // Setup endpoints
  async getSetupStatus() {
    return this.request("/setup/status");
  }

  async completeSetup(
    masterPin: string,
    people: Array<{ name: string; pin?: string; isAdmin: boolean }>
  ) {
    return this.request("/setup/complete", {
      method: "POST",
      body: JSON.stringify({ masterPin, people }),
    });
  }

  async verifyMasterPin(pin: string) {
    return this.request("/setup/verify-master", {
      method: "POST",
      body: JSON.stringify({ pin }),
    });
  }

  // Person endpoints
  async getPersons() {
    return this.request("/persons");
  }

  async createPerson(data: any) {
    return this.request("/persons", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updatePerson(id: number, data: any) {
    return this.request(`/persons/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deletePerson(id: number) {
    return this.request(`/persons/${id}`, {
      method: "DELETE",
    });
  }

  async resetPoints(id: number, points: number = 0) {
    return this.request(`/persons/${id}/reset-points`, {
      method: "POST",
      body: JSON.stringify({ points }),
    });
  }

  async awardBonusPoints(id: number, points: number) {
    return this.request(`/persons/${id}/bonus-points`, {
      method: "POST",
      body: JSON.stringify({ points }),
    });
  }

  // Chore endpoints
  async getChores() {
    return this.request("/chores");
  }

  async createChore(data: any) {
    return this.request("/chores", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateChore(id: number, data: any) {
    return this.request(`/chores/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async completeChore(id: number) {
    return this.request(`/chores/${id}/complete`, {
      method: "POST",
    });
  }

  async deleteChore(id: number) {
    return this.request(`/chores/${id}`, {
      method: "DELETE",
    });
  }

  // Reward endpoints
  async getRewards() {
    return this.request("/rewards");
  }

  async createReward(data: any) {
    return this.request("/rewards", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async completeReward(id: number) {
    return this.request(`/rewards/${id}/complete`, {
      method: "POST",
    });
  }

  async fulfillReward(id: number) {
    return this.request(`/rewards/${id}/fulfill`, {
      method: "POST",
    });
  }

  async getPendingRedemptions() {
    return this.request("/rewards/pending-redemptions");
  }

  async deleteReward(id: number) {
    return this.request(`/rewards/${id}`, {
      method: "DELETE",
    });
  }

  // Activity endpoints
  async getActivities(
    params: { limit?: number; offset?: number; type?: string } = {}
  ) {
    const searchParams = new URLSearchParams();
    if (params.limit) searchParams.append("limit", params.limit.toString());
    if (params.offset) searchParams.append("offset", params.offset.toString());
    if (params.type) searchParams.append("type", params.type);

    const query = searchParams.toString();
    return this.request(`/activities${query ? `?${query}` : ""}`);
  }

  // Settings endpoints
  async getSettings() {
    return this.request("/settings");
  }

  async updateSetting(key: string, value: string) {
    return this.request(`/settings/${key}`, {
      method: "PUT",
      body: JSON.stringify({ value }),
    });
  }

  // Health check
  async healthCheck() {
    return this.request("/health");
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;
