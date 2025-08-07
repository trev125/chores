import React, { useState } from "react";
import type { Person } from "../../types";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Button from "../ui/Button";

interface RewardFormData {
  title: string;
  pointsRequired: number;
  assignedToId: number | null;
  isOneTime: boolean;
}

interface RewardFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RewardFormData) => Promise<void>;
  persons: Person[];
}

const RewardForm: React.FC<RewardFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  persons,
}) => {
  const [formData, setFormData] = useState<RewardFormData>({
    title: "",
    pointsRequired: 10,
    assignedToId: null,
    isOneTime: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        title: "",
        pointsRequired: 10,
        assignedToId: null,
        isOneTime: true,
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
      setError(err instanceof Error ? err.message : "Failed to create reward");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Reward">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="text-red-600 text-sm">{error}</div>}

        <Input
          label="Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Enter reward title"
          required
        />

        <Input
          label="Points Required"
          type="number"
          min="1"
          value={formData.pointsRequired}
          onChange={(e) =>
            setFormData({
              ...formData,
              pointsRequired: parseInt(e.target.value) || 1,
            })
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
            <option value="">Available to everyone</option>
            {persons.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center">
          <input
            id="isOneTime"
            type="checkbox"
            checked={formData.isOneTime}
            onChange={(e) =>
              setFormData({
                ...formData,
                isOneTime: e.target.checked,
              })
            }
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label
            htmlFor="isOneTime"
            className="ml-2 block text-sm text-gray-700"
          >
            One-time reward (can only be redeemed once)
          </label>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Create Reward
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default RewardForm;
