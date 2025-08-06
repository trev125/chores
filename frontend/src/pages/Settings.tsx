import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useData } from "../contexts/DataContext";
import type { Person } from "../types";
import {
  PageHeader,
  Card,
  Button,
  LoadingSpinner,
  ErrorMessage,
  EmptyState,
  Modal,
  TabNav,
  PersonCard,
  ChoreCard,
  RewardCard,
  ErrorBoundary,
  PersonFormContent,
  ChoreForm,
  RewardForm,
  ConfirmDialog,
} from "../components";

interface PersonFormData {
  name: string;
  pin: string;
  color: string;
  is_admin: boolean;
}

const Settings: React.FC = () => {
  const { user, logout } = useAuth();
  const {
    persons,
    chores,
    rewards,
    loading,
    error,
    addPerson,
    updatePerson,
    deletePerson,
    addChore,
    deleteChore,
    addReward,
    deleteReward,
  } = useData();

  const [activeTab, setActiveTab] = useState("people");
  const [showPersonForm, setShowPersonForm] = useState(false);
  const [showChoreForm, setShowChoreForm] = useState(false);
  const [showRewardForm, setShowRewardForm] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [deletingItem, setDeletingItem] = useState<{
    type: string;
    id: number;
    name: string;
  } | null>(null);

  const tabs = [
    { key: "people", label: "Family Members" },
    { key: "chores", label: "Chores" },
    { key: "rewards", label: "Rewards" },
    { key: "system", label: "System" },
  ];

  const handleAddPerson = async (data: PersonFormData) => {
    try {
      await addPerson(data);
      setShowPersonForm(false);
    } catch (error) {
      console.error("Failed to add person:", error);
    }
  };

  const handleUpdatePerson = async (data: PersonFormData) => {
    if (editingPerson) {
      try {
        await updatePerson(editingPerson.id, data);
        setEditingPerson(null);
      } catch (error) {
        console.error("Failed to update person:", error);
      }
    }
  };

  const handleDeleteConfirm = async () => {
    if (deletingItem) {
      try {
        switch (deletingItem.type) {
          case "person":
            await deletePerson(deletingItem.id);
            break;
          case "chore":
            await deleteChore(deletingItem.id);
            break;
          case "reward":
            await deleteReward(deletingItem.id);
            break;
        }
        setDeletingItem(null);
      } catch (error) {
        console.error("Failed to delete item:", error);
      }
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading settings..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Manage your family chore system" />

      <Card>
        <TabNav tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="mt-6">
          {activeTab === "people" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">
                  Family Members
                </h3>
                <Button onClick={() => setShowPersonForm(true)}>
                  Add Person
                </Button>
              </div>

              {persons.length === 0 ? (
                <EmptyState
                  title="No family members"
                  description="Add family members to start using the chore system."
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {persons.map((person) => (
                    <PersonCard
                      key={person.id}
                      person={person}
                      onEdit={() => setEditingPerson(person)}
                      onDelete={() =>
                        setDeletingItem({
                          type: "person",
                          id: person.id,
                          name: person.name,
                        })
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "chores" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Chores</h3>
                <Button onClick={() => setShowChoreForm(true)}>
                  Add Chore
                </Button>
              </div>

              {chores.length === 0 ? (
                <EmptyState
                  title="No chores"
                  description="Add chores for family members to complete."
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {chores.map((chore) => (
                    <ChoreCard
                      key={chore.id}
                      chore={chore}
                      persons={persons}
                      onDelete={() =>
                        setDeletingItem({
                          type: "chore",
                          id: chore.id,
                          name: chore.title,
                        })
                      }
                      showActions={false}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "rewards" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Rewards</h3>
                <Button onClick={() => setShowRewardForm(true)}>
                  Add Reward
                </Button>
              </div>

              {rewards.length === 0 ? (
                <EmptyState
                  title="No rewards"
                  description="Add rewards that family members can redeem with their points."
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rewards.map((reward) => (
                    <RewardCard
                      key={reward.id}
                      reward={reward}
                      onDelete={() =>
                        setDeletingItem({
                          type: "reward",
                          id: reward.id,
                          name: reward.title,
                        })
                      }
                      showActions={false}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "system" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  System Settings
                </h3>
                <div className="space-y-4">
                  <Card>
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          Account
                        </h4>
                        <p className="text-sm text-gray-500">
                          Signed in as {user?.name}
                        </p>
                      </div>
                      <Button variant="danger" onClick={logout}>
                        Sign Out
                      </Button>
                    </div>
                  </Card>

                  <Card>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Statistics
                      </h4>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-2xl font-bold text-blue-600">
                            {persons.length}
                          </p>
                          <p className="text-xs text-gray-500">
                            Family Members
                          </p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-green-600">
                            {chores.filter((c) => c.completed).length}
                          </p>
                          <p className="text-xs text-gray-500">
                            Completed Chores
                          </p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-yellow-600">
                            {rewards.filter((r) => r.completed).length}
                          </p>
                          <p className="text-xs text-gray-500">
                            Redeemed Rewards
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Add Person Modal */}
      <Modal
        isOpen={showPersonForm}
        onClose={() => setShowPersonForm(false)}
        title="Add Family Member"
      >
        <ErrorBoundary>
          <PersonFormContent
            onSubmit={handleAddPerson}
            onCancel={() => setShowPersonForm(false)}
          />
        </ErrorBoundary>
      </Modal>

      {/* Edit Person Modal */}
      <Modal
        isOpen={!!editingPerson}
        onClose={() => setEditingPerson(null)}
        title="Edit Family Member"
      >
        {editingPerson && (
          <ErrorBoundary>
            <PersonFormContent
              initialData={editingPerson}
              onSubmit={handleUpdatePerson}
              onCancel={() => setEditingPerson(null)}
            />
          </ErrorBoundary>
        )}
      </Modal>

      {/* Add Chore Modal */}
      <Modal
        isOpen={showChoreForm}
        onClose={() => setShowChoreForm(false)}
        title="Add Chore"
      >
        <ChoreForm
          isOpen={showChoreForm}
          onClose={() => setShowChoreForm(false)}
          onSubmit={async (data) => {
            await addChore(data);
            setShowChoreForm(false);
          }}
          persons={persons}
        />
      </Modal>

      {/* Add Reward Modal */}
      <Modal
        isOpen={showRewardForm}
        onClose={() => setShowRewardForm(false)}
        title="Add Reward"
      >
        <RewardForm
          isOpen={showRewardForm}
          onClose={() => setShowRewardForm(false)}
          onSubmit={async (data) => {
            await addReward(data);
            setShowRewardForm(false);
          }}
          persons={persons}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingItem}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleDeleteConfirm}
        title={`Delete ${deletingItem?.type}`}
        message={`Are you sure you want to delete "${deletingItem?.name}"? This action cannot be undone.`}
        confirmText="Delete"
      />
    </div>
  );
};

export default Settings;
