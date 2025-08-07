import React, { useState } from "react";
import type { Person, Reward } from "../../types";
import Input from "../ui/Input";
import Button from "../ui/Button";

interface RewardFormData {
  title: string;
  points_required: number;
  assigned_to_id: number | null;
  is_one_time: boolean;
}

interface RewardFormContentProps {
  onSubmit: (data: RewardFormData) => Promise<void>;
  onCancel: () => void;
  initialData?: Reward | null;
  persons: Person[];
}

const RewardFormContent: React.FC<RewardFormContentProps> = ({
  onSubmit,
  onCancel,
  initialData,
  persons,
}) => {
  const [formData, setFormData] = useState<RewardFormData>({
    title: initialData?.title || "",
    points_required: initialData?.points_required || 10,
    assigned_to_id: initialData?.assigned_to_id || null,
    is_one_time: initialData?.is_one_time ?? true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save reward");
    } finally {
      setLoading(false);
    }
  };

  return (
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
        value={formData.points_required}
        onChange={(e) =>
          setFormData({
            ...formData,
            points_required: parseInt(e.target.value) || 1,
          })
        }
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Assign To
        </label>
        <select
          value={formData.assigned_to_id || ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              assigned_to_id: e.target.value ? parseInt(e.target.value) : null,
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
          id="is_one_time"
          type="checkbox"
          checked={formData.is_one_time}
          onChange={(e) =>
            setFormData({
              ...formData,
              is_one_time: e.target.checked,
            })
          }
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label
          htmlFor="is_one_time"
          className="ml-2 block text-sm text-gray-700"
        >
          One-time reward (can only be redeemed once)
        </label>
      </div>

      <div className="flex space-x-3">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? "Saving..." : initialData ? "Update" : "Add"}
        </Button>
      </div>
    </form>
  );
};

export default RewardFormContent;
