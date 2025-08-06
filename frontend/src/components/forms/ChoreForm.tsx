import React, { useState } from "react";
import type { Person } from "../../types";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Button from "../ui/Button";

interface ChoreFormData {
  title: string;
  assignedToId: number | null;
  points: number;
  isDaily: boolean;
  dueDate: string;
}

interface ChoreFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ChoreFormData) => Promise<void>;
  persons: Person[];
}

const ChoreForm: React.FC<ChoreFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  persons,
}) => {
  const [formData, setFormData] = useState<ChoreFormData>({
    title: "",
    assignedToId: null,
    points: 1,
    isDaily: false,
    dueDate: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        title: "",
        assignedToId: null,
        points: 1,
        isDaily: false,
        dueDate: "",
      });
      setError("");
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError("Title is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create chore");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Chore">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="text-red-600 text-sm">{error}</div>}

        <Input
          label="Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Enter chore title"
          required
        />

        <Input
          label="Points"
          type="number"
          min="1"
          value={formData.points}
          onChange={(e) =>
            setFormData({ ...formData, points: parseInt(e.target.value) || 1 })
          }
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Assign To
          </label>
          <select
            value={formData.assignedToId || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                assignedToId: e.target.value ? parseInt(e.target.value) : null,
              })
            }
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Anyone can complete</option>
            {persons.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Due Date (optional)"
          type="date"
          value={formData.dueDate}
          onChange={(e) =>
            setFormData({ ...formData, dueDate: e.target.value })
          }
        />

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isDaily"
            checked={formData.isDaily}
            onChange={(e) =>
              setFormData({ ...formData, isDaily: e.target.checked })
            }
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="isDaily" className="ml-2 text-sm text-gray-700">
            Daily chore
          </label>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Create Chore
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ChoreForm;
