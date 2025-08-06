import React from "react";
import type { Reward, Person } from "../../types";
import Card from "../ui/Card";
import Button from "../ui/Button";

interface RewardCardProps {
  reward: Reward;
  persons?: Person[];
  onRedeem?: (rewardId: number) => void;
  onDelete?: (rewardId: number) => void;
  showActions?: boolean;
}

const RewardCard: React.FC<RewardCardProps> = ({
  reward,
  persons = [],
  onRedeem,
  onDelete,
  showActions = true,
}) => {
  const assignedPerson = persons.find((p) => p.id === reward.assigned_to_id);

  return (
    <Card>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {reward.title}
          </p>
          <p className="text-sm text-gray-500">
            {reward.points_required} points required
          </p>
          {assignedPerson && (
            <p className="text-xs text-blue-600 mt-1">
              For: {assignedPerson.name}
            </p>
          )}
        </div>
        {showActions && (onRedeem || onDelete) && (
          <div className="ml-4 flex flex-col space-y-2">
            {onRedeem && !reward.completed && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onRedeem(reward.id)}
              >
                Redeem
              </Button>
            )}
            {onDelete && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => onDelete(reward.id)}
              >
                Delete
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default RewardCard;
