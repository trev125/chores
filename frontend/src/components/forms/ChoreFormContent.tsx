import React, { useState } from "react";
import type { Person, Chore } from "../../types";
import Input from "../ui/Input";
import Button from "../ui/Button";

interface ChoreFormData {
  title: string;
  assigned_to_id: number | null;
  points: number;
  is_daily: boolean;
  due_date: string;
}

interface ChoreFormContentProps {
  onSubmit: (data: ChoreFormData) => Promise<void>;
  onCancel: () => void;
  initialData?: Chore | null;
  persons: Person[];
}

const ChoreFormContent: React.FC<ChoreFormContentProps> = ({
  onSubmit,
  onCancel,
  initialData,
  persons,
}) => {
  const [formData, setFormData] = useState<ChoreFormData>({
    title: initialData?.title || "",
    assigned_to_id: initialData?.assigned_to_id || null,
    points: initialData?.points || 1,
    is_daily: initialData?.is_daily || false,
    due_date: initialData?.due_date || "",
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
      setError(err instanceof Error ? err.message : "Failed to save chore");
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
          value={formData.assigned_to_id || ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              assigned_to_id: e.target.value ? parseInt(e.target.value) : null,
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
        value={formData.due_date}
        onChange={(e) =>
          setFormData({ ...formData, due_date: e.target.value })
        }
      />

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isDaily"
          checked={formData.is_daily}
          onChange={(e) =>
            setFormData({ ...formData, is_daily: e.target.checked })
          }
          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="isDaily" className="ml-2 text-sm text-gray-700">
          Daily chore
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

export default ChoreFormContent;
