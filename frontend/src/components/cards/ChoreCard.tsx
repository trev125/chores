import React from "react";
import type { Chore, Person } from "../../types";
import Card from "../ui/Card";
import Button from "../ui/Button";

interface ChoreCardProps {
  chore: Chore;
  persons?: Person[];
  onComplete?: (choreId: number) => void;
  onDelete?: (choreId: number) => void;
  showActions?: boolean;
}

const ChoreCard: React.FC<ChoreCardProps> = ({
  chore,
  persons = [],
  onComplete,
  onDelete,
  showActions = true,
}) => {
  const assignedPerson = persons.find((p) => p.id === chore.assigned_to_id);

  return (
    <Card>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {chore.title}
          </p>
          <p className="text-sm text-gray-500">{chore.points} points</p>
          {assignedPerson && (
            <p className="text-xs text-blue-600 mt-1">
              Assigned to: {assignedPerson.name}
            </p>
          )}
          {chore.is_daily ? (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-2">
              Daily
            </span>
          ) : null}
        </div>
        {showActions && (onComplete || onDelete) && (
          <div className="ml-4 flex flex-col space-y-2">
            {onComplete && !chore.completed && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onComplete(chore.id)}
              >
                Complete
              </Button>
            )}
            {onDelete && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => onDelete(chore.id)}
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

export default ChoreCard;
