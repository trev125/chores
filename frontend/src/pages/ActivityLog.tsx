import React from "react";
import { useData } from "../contexts/DataContext";
import type { ActivityLog } from "../types";
import {
  PageHeader,
  Card,
  LoadingSpinner,
  ErrorMessage,
  EmptyState,
} from "../components";

interface ActivityItemProps {
  activity: ActivityLog;
  isLast: boolean;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ activity, isLast }) => {
  const getActivityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "chore_completed":
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600">
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        );
      case "reward_redeemed":
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100 text-yellow-600">
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
              />
            </svg>
          </div>
        );
      case "points_awarded":
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              />
            </svg>
          </div>
        );
      default:
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600">
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        );
    }
  };

  return (
    <li>
      <div className="relative pb-8">
        {!isLast && (
          <span
            className="absolute left-4 top-8 -ml-px h-full w-0.5 bg-gray-200"
            aria-hidden="true"
          />
        )}
        <div className="relative flex space-x-3">
          {getActivityIcon(activity.type)}
          <div className="flex min-w-0 flex-1 justify-between space-x-4">
            <div>
              <p className="text-sm text-gray-900">{activity.description}</p>
              {activity.user_name && (
                <p className="text-xs text-gray-500">by {activity.user_name}</p>
              )}
            </div>
            <div className="whitespace-nowrap text-right text-sm text-gray-500">
              <time dateTime={activity.date}>
                {new Date(activity.date).toLocaleDateString()}{" "}
                {new Date(activity.date).toLocaleTimeString()}
              </time>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};

const ActivityLogPage: React.FC = () => {
  const { activities, loading, error } = useData();

  if (loading) {
    return <LoadingSpinner text="Loading activity log..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity Log"
        subtitle="Recent family activity and achievements"
      />

      <Card>
        {activities.length === 0 ? (
          <EmptyState
            title="No activities recorded yet"
            description="Start completing chores and redeeming rewards to see activity here."
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
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
            }
          />
        ) : (
          <div className="flow-root">
            <ul className="-mb-8">
              {activities.map((activity, index) => (
                <ActivityItem
                  key={activity.id}
                  activity={activity}
                  isLast={index === activities.length - 1}
                />
              ))}
            </ul>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ActivityLogPage;
