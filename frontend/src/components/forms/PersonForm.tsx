import React, { useState } from "react";
import type { Person } from "../../types";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Button from "../ui/Button";

interface PersonFormData {
  name: string;
  pin: string;
  color: string;
  is_admin: boolean;
}

interface PersonFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PersonFormData) => Promise<void>;
  editingPerson?: Person | null;
  title?: string;
}

const PersonForm: React.FC<PersonFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingPerson,
  title,
}) => {
  const [formData, setFormData] = useState<PersonFormData>({
    name: editingPerson?.name || "",
    pin: "",
    color: editingPerson?.color || "#3B82F6",
    is_admin: editingPerson?.is_admin || false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  React.useEffect(() => {
    if (editingPerson) {
      setFormData({
        name: editingPerson.name,
        pin: "",
        color: editingPerson.color,
        is_admin: editingPerson.is_admin,
      });
    } else {
      setFormData({
        name: "",
        pin: "",
        color: "#3B82F6",
        is_admin: false,
      });
    }
    setError("");
  }, [editingPerson, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Name is required");
      return;
    }
    if (!editingPerson && !formData.pin.trim()) {
      setError("PIN is required for new users");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save person");
    } finally {
      setLoading(false);
    }
  };

  const modalTitle = title || (editingPerson ? "Edit Person" : "Add Person");

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="text-red-600 text-sm">{error}</div>}

        <Input
          label="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter name"
          required
        />

        <Input
          label={
            editingPerson ? "New PIN (leave blank to keep current)" : "PIN"
          }
          type="password"
          value={formData.pin}
          onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
          placeholder="Enter PIN"
          required={!editingPerson}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Color
          </label>
          <input
            type="color"
            value={formData.color}
            onChange={(e) =>
              setFormData({ ...formData, color: e.target.value })
            }
            className="h-10 w-20 border border-gray-300 rounded-md"
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
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="isAdmin" className="ml-2 text-sm text-gray-700">
            Admin privileges
          </label>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {editingPerson ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default PersonForm;
