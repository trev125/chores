import React, { useState } from "react";
import type { Person } from "../../types";
import Input from "../ui/Input";
import Button from "../ui/Button";

interface PersonFormData {
  name: string;
  pin: string;
  color: string;
  is_admin: boolean;
}

interface PersonFormContentProps {
  onSubmit: (data: PersonFormData) => Promise<void>;
  onCancel: () => void;
  initialData?: Person | null;
}

const PersonFormContent: React.FC<PersonFormContentProps> = ({
  onSubmit,
  onCancel,
  initialData,
}) => {
  const [formData, setFormData] = useState<PersonFormData>({
    name: initialData?.name || "",
    pin: initialData?.pin || "",
    color: initialData?.color || "#3B82F6",
    is_admin: initialData?.is_admin || false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError("Name is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await onSubmit(formData);
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || "Failed to save person");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Name"
        type="text"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="Enter name"
        required
      />

      <Input
        label="PIN (optional)"
        type="text"
        value={formData.pin}
        onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
        placeholder="Enter personal PIN"
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Color
        </label>
        <input
          type="color"
          value={formData.color}
          onChange={(e) => setFormData({ ...formData, color: e.target.value })}
          className="h-10 w-20 border border-gray-300 rounded-md cursor-pointer"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isAdmin"
          checked={formData.is_admin}
          onChange={(e) =>
            setFormData({ ...formData, is_admin: e.target.checked })
          }
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="isAdmin" className="ml-2 block text-sm text-gray-700">
          Admin privileges
        </label>
      </div>

      {error && <div className="text-red-600 text-sm">{error}</div>}

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

export default PersonFormContent;
