import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useData } from "../contexts/DataContext";
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import ErrorMessage from "../components/ui/ErrorMessage";
import EmptyState from "../components/ui/EmptyState";
import ChoreCard from "../components/cards/ChoreCard";
import RewardCard from "../components/cards/RewardCard";
import TabNav from "../components/ui/TabNav";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const {
    persons,
    chores,
    rewards,
    pendingRedemptions,
    loading,
    error,
    completeChore,
    completeReward,
    fulfillReward,
  } = useData();

  const [activeTab, setActiveTab] = useState<"chores" | "rewards">("chores");
  const [rewardsTab, setRewardsTab] = useState<"available" | "pending">(
    "available"
  );

  if (loading) {
    return <LoadingSpinner text="Loading dashboard..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  // Admin Dashboard
  if (user?.is_admin) {
    const availableChores = chores.filter((chore) => !chore.completed);
    const availableRewards = rewards.filter(
      (reward) =>
        !reward.completed ||
        (!reward.is_one_time && !reward.title.includes("(Redeemed)"))
    );

    return (
      <div className="space-y-6">
        <PageHeader
          title="Admin Dashboard"
          subtitle="Manage the family chore system"
        />

        {/* Pending Redemptions Alert */}
        {pendingRedemptions.length > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-orange-800">
                  Pending Reward Redemptions ({pendingRedemptions.length})
                </h3>
                <p className="text-sm text-orange-600">
                  Family members have redeemed rewards that need fulfillment.
                </p>
              </div>
              <Button
                variant="primary"
                onClick={() => setRewardsTab("pending")}
              >
                Review
              </Button>
            </div>
          </Card>
        )}

        {persons.length === 0 ? (
          <EmptyState
            title="No family members found"
            description="Add family members in Settings to get started."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {persons.map((person) => (
              <Card key={person.id}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {person.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {person.points} points
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                    <span className="text-lg font-medium text-blue-600">
                      {person.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Personal chores */}
                  {availableChores.filter(
                    (chore) =>
                      chore.assigned_to === person.id.toString() ||
                      chore.assigned_to === person.name
                  ).length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Available Chores
                      </h4>
                      <div className="space-y-2">
                        {availableChores
                          .filter(
                            (chore) =>
                              chore.assigned_to === person.id.toString() ||
                              chore.assigned_to === person.name
                          )
                          .slice(0, 3)
                          .map((chore) => (
                            <div
                              key={chore.id}
                              className="p-3 bg-gray-50 rounded-lg"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {chore.title}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {chore.points} points
                                  </p>
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => completeChore(chore.id)}
                                >
                                  Complete
                                </Button>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Affordable rewards */}
                  {availableRewards.filter(
                    (reward) => person.points >= reward.points_required
                  ).length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Available Rewards
                      </h4>
                      <div className="space-y-2">
                        {availableRewards
                          .filter(
                            (reward) => person.points >= reward.points_required
                          )
                          .slice(0, 2)
                          .map((reward) => (
                            <div
                              key={reward.id}
                              className="p-3 bg-gray-50 rounded-lg"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {reward.title}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {reward.points_required} points
                                  </p>
                                </div>
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => completeReward(reward.id)}
                                >
                                  Redeem
                                </Button>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Empty state for individual cards */}
                  {availableChores.filter(
                    (chore) =>
                      chore.assigned_to === person.id.toString() ||
                      chore.assigned_to === person.name
                  ).length === 0 &&
                    availableRewards.filter(
                      (reward) => person.points >= reward.points_required
                    ).length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No chores or rewards available
                      </p>
                    )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* All Chores Section */}
        {availableChores.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              All Available Chores
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableChores.map((chore) => (
                <ChoreCard
                  key={chore.id}
                  chore={chore}
                  persons={persons}
                  onComplete={completeChore}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Rewards Section */}
        {(availableRewards.length > 0 || pendingRedemptions.length > 0) && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">All Rewards</h3>
              <TabNav
                tabs={[
                  { key: "available", label: "Available" },
                  {
                    key: "pending",
                    label: `Pending (${pendingRedemptions.length})`,
                  },
                ]}
                activeTab={rewardsTab}
                onTabChange={(tab) =>
                  setRewardsTab(tab as "available" | "pending")
                }
              />
            </div>

            {rewardsTab === "available" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableRewards.map((reward) => (
                  <RewardCard
                    key={reward.id}
                    reward={reward}
                    onRedeem={completeReward}
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingRedemptions.map((reward) => (
                  <Card key={reward.id} className="border-orange-200">
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {reward.title}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {reward.points_required} points
                        </p>
                        <p className="text-sm text-orange-600">
                          Redeemed by:{" "}
                          {reward.redeemed_by_id
                            ? persons.find(
                                (p) => p.id === reward.redeemed_by_id
                              )?.name || "Unknown"
                            : "Unknown"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {reward.redeemed_at
                            ? new Date(reward.redeemed_at).toLocaleDateString()
                            : "Date unknown"}
                        </p>
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => fulfillReward(reward.id)}
                        className="w-full"
                      >
                        Mark as Fulfilled
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Non-Admin Dashboard
  const currentUser = persons.find((p) => p.id === user?.id);
  if (!currentUser) {
    return <ErrorMessage message="User not found" />;
  }

  const userChores = chores.filter(
    (chore) =>
      !chore.completed &&
      (chore.assigned_to_id === user?.id || chore.assigned_to === user?.name)
  );

  const userAffordableRewards = rewards.filter(
    (reward) =>
      (!reward.completed ||
        (!reward.is_one_time && !reward.title.includes("(Redeemed)"))) &&
      currentUser.points >= reward.points_required &&
      (!reward.assigned_to_id || reward.assigned_to_id === user?.id)
  );

  const userRedeemedRewards = rewards.filter(
    (reward) => reward.redeemed_by_id === user?.id
  );

  const tabs = [
    { key: "chores", label: `Chores (${userChores.length})` },
    { key: "rewards", label: `Rewards (${userAffordableRewards.length})` },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${currentUser.name}!`}
        subtitle={`You have ${currentUser.points} points`}
      />

      {/* User Stats Card */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <span className="text-2xl font-medium text-blue-600">
                {currentUser.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {currentUser.name}
              </h2>
              <p className="text-lg text-blue-600 font-medium">
                {currentUser.points} points
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Available chores</p>
            <p className="text-2xl font-bold text-gray-900">
              {userChores.length}
            </p>
          </div>
        </div>
      </Card>

      {/* Redeemed Rewards Status */}
      {userRedeemedRewards.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <h3 className="text-lg font-medium text-green-800 mb-3">
            Your Redeemed Rewards
          </h3>
          <div className="space-y-2">
            {userRedeemedRewards.map((reward) => (
              <div
                key={reward.id}
                className="flex items-center justify-between p-2 bg-white rounded"
              >
                <div>
                  <p className="font-medium text-gray-900">{reward.title}</p>
                  <p className="text-sm text-gray-500">
                    {reward.redeemed_at
                      ? `Redeemed ${new Date(
                          reward.redeemed_at
                        ).toLocaleDateString()}`
                      : "Redeemed"}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    reward.fulfilled
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {reward.fulfilled ? "Fulfilled" : "Pending"}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tab Navigation */}
      <TabNav
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as "chores" | "rewards")}
      />

      {/* Tab Content */}
      {activeTab === "chores" ? (
        <div>
          {userChores.length === 0 ? (
            <EmptyState
              title="No chores available"
              description="Great job! You've completed all your chores."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userChores.map((chore) => (
                <ChoreCard
                  key={chore.id}
                  chore={chore}
                  persons={persons}
                  onComplete={completeChore}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          {userAffordableRewards.length === 0 ? (
            <EmptyState
              title="No rewards available"
              description="Complete more chores to earn points for rewards!"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userAffordableRewards.map((reward) => (
                <RewardCard
                  key={reward.id}
                  reward={reward}
                  onRedeem={completeReward}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
