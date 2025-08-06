import React from "react";
import { useData } from "../contexts/DataContext";
import type { Chore } from "../types";
import {
  PageHeader,
  Card,
  LoadingSpinner,
  ErrorMessage,
  EmptyState,
} from "../components";

interface StatCardProps {
  title: string;
  value: number;
  color: "green" | "blue";
}

const StatCard: React.FC<StatCardProps> = ({ title, value, color }) => {
  const colorClasses = {
    green: "text-green-600",
    blue: "text-blue-600",
  };

  return (
    <Card>
      <div className={`text-2xl font-bold ${colorClasses[color]}`}>{value}</div>
      <div className="text-sm text-gray-500">{title}</div>
    </Card>
  );
};

interface ChoreTableProps {
  chores: Chore[];
  title: string;
}

const ChoreTable: React.FC<ChoreTableProps> = ({ chores, title }) => {
  if (chores.length === 0) {
    return (
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
          <EmptyState
            title="No chores to display"
            description="There are no chores in this category yet."
            icon={
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 7h.01M9 16h.01M13 13h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
            }
          />
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Chore
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Points
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {chores[0]?.completed ? "Completed" : "Status"}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {chores
                .sort((a, b) => {
                  if (a.completed && a.date_completed && b.date_completed) {
                    return (
                      new Date(b.date_completed).getTime() -
                      new Date(a.date_completed).getTime()
                    );
                  }
                  return a.title.localeCompare(b.title);
                })
                .map((chore) => (
                  <tr key={chore.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {chore.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {chore.person_name || chore.assigned_to || "Unassigned"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {chore.points}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {chore.completed && chore.date_completed
                        ? new Date(chore.date_completed).toLocaleDateString()
                        : chore.completed
                        ? "Completed"
                        : "Pending"}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
};

const ChoreHistory: React.FC = () => {
  const { chores, loading, error } = useData();

  if (loading) {
    return <LoadingSpinner text="Loading chore history..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  const completedChores = chores.filter((chore) => chore.completed);
  const pendingChores = chores.filter(
    (chore) => !chore.completed && !chore.deleted
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Chore History"
        subtitle="Track completed and pending chores"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          title="Completed Chores"
          value={completedChores.length}
          color="green"
        />
        <StatCard
          title="Pending Chores"
          value={pendingChores.length}
          color="blue"
        />
      </div>

      {/* Completed Chores */}
      <ChoreTable chores={completedChores} title="Recently Completed" />

      {/* Pending Chores */}
      {pendingChores.length > 0 && (
        <ChoreTable chores={pendingChores} title="Pending Chores" />
      )}
    </div>
  );
};

export default ChoreHistory;
