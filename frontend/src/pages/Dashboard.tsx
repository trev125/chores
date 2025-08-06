import React from "react";
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

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const {
    persons,
    chores,
    rewards,
    loading,
    error,
    completeChore,
    completeReward,
  } = useData();

  if (loading) {
    return <LoadingSpinner text="Loading dashboard..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  const availableChores = chores.filter((chore) => !chore.completed);
  const availableRewards = rewards.filter((reward) => !reward.completed);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Family Dashboard"
        subtitle="Track chores, earn points, and redeem rewards"
      />

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
      {user?.is_admin && availableChores.length > 0 && (
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
      {user?.is_admin && availableRewards.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            All Available Rewards
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableRewards.map((reward) => (
              <RewardCard
                key={reward.id}
                reward={reward}
                onRedeem={completeReward}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
