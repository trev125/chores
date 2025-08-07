import React from "react";
import type { Person } from "../../types";
import Card from "../ui/Card";
import Button from "../ui/Button";

interface PersonCardProps {
  person: Person;
  onEdit?: (person: Person) => void;
  onDelete?: (person: Person) => void;
  showActions?: boolean;
}

const PersonCard: React.FC<PersonCardProps> = ({
  person,
  onEdit,
  onDelete,
  showActions = true,
}) => {
  return (
    <Card>
      <div className="flex items-center space-x-3">
        <div
          className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold"
          style={{ backgroundColor: person.color }}
        >
          {person.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {person.name}
          </p>
          <p className="text-sm text-gray-500">
            {person.points} points
            {person.is_admin ? " • Admin" : ""}
          </p>
        </div>
      </div>
      {showActions && (onEdit || onDelete) && (
        <div className="mt-4 flex space-x-2">
          {onEdit && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onEdit(person)}
            >
              Edit
            </Button>
          )}
          {onDelete && (
            <Button variant="danger" size="sm" onClick={() => onDelete(person)}>
              Delete
            </Button>
          )}
        </div>
      )}
    </Card>
  );
};

export default PersonCard;
