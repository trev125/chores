import React, { useState } from "react";
import { apiClient } from "../utils/api";
import {
  Card,
  Button,
  Input,
  ErrorMessage,
  LoadingSpinner,
} from "../components";

interface Person {
  name: string;
  pin: string;
  isAdmin: boolean;
}

interface SetupWizardProps {
  onSetupComplete: () => void;
}

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
}) => (
  <div className="mb-6">
    <div className="flex items-center">
      <div
        className={`flex-1 ${
          currentStep >= 1 ? "bg-blue-500" : "bg-gray-200"
        } h-1 rounded`}
      />
      <div className="mx-2 text-xs text-gray-500">
        Step {currentStep} of {totalSteps}
      </div>
      <div
        className={`flex-1 ${
          currentStep >= 2 ? "bg-blue-500" : "bg-gray-200"
        } h-1 rounded`}
      />
    </div>
  </div>
);

interface Step1Props {
  masterPin: string;
  confirmPin: string;
  onMasterPinChange: (value: string) => void;
  onConfirmPinChange: (value: string) => void;
  onNext: () => void;
  error: string;
}

const Step1: React.FC<Step1Props> = ({
  masterPin,
  confirmPin,
  onMasterPinChange,
  onConfirmPinChange,
  onNext,
  error,
}) => (
  <div className="space-y-4">
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Set Master PIN</h3>
      <p className="text-sm text-gray-600 mb-4">
        This PIN will be used for admin access and managing the system.
      </p>
    </div>

    <Input
      label="Master PIN"
      type="password"
      value={masterPin}
      onChange={(e) => onMasterPinChange(e.target.value)}
      placeholder="Enter master PIN"
      required
    />

    <Input
      label="Confirm Master PIN"
      type="password"
      value={confirmPin}
      onChange={(e) => onConfirmPinChange(e.target.value)}
      placeholder="Confirm master PIN"
      required
    />

    {error && <ErrorMessage message={error} />}

    <Button type="button" onClick={onNext} className="w-full">
      Next
    </Button>
  </div>
);

interface PersonFormProps {
  person: Person;
  index: number;
  onUpdate: (
    index: number,
    field: keyof Person,
    value: string | boolean
  ) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
}

const PersonForm: React.FC<PersonFormProps> = ({
  person,
  index,
  onUpdate,
  onRemove,
  canRemove,
}) => (
  <div className="border border-gray-200 rounded-lg p-4 space-y-3">
    <div className="flex justify-between items-center">
      <h4 className="text-sm font-medium text-gray-900">Person {index + 1}</h4>
      {canRemove && (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => onRemove(index)}
          className="text-red-600 border-red-200 hover:bg-red-50"
        >
          Remove
        </Button>
      )}
    </div>

    <Input
      label="Name"
      type="text"
      value={person.name}
      onChange={(e) => onUpdate(index, "name", e.target.value)}
      placeholder="Enter name"
      required
    />

    <Input
      label="Personal PIN (optional)"
      type="text"
      value={person.pin}
      onChange={(e) => onUpdate(index, "pin", e.target.value)}
      placeholder="Enter personal PIN"
    />

    <div className="flex items-center">
      <input
        type="checkbox"
        id={`admin-${index}`}
        checked={person.isAdmin}
        onChange={(e) => onUpdate(index, "isAdmin", e.target.checked)}
        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
      />
      <label
        htmlFor={`admin-${index}`}
        className="ml-2 block text-sm text-gray-700"
      >
        Admin privileges
      </label>
    </div>
  </div>
);

interface Step2Props {
  people: Person[];
  onUpdate: (
    index: number,
    field: keyof Person,
    value: string | boolean
  ) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  error: string;
}

const Step2: React.FC<Step2Props> = ({
  people,
  onUpdate,
  onAdd,
  onRemove,
  onBack,
  onSubmit,
  loading,
  error,
}) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Add Family Members
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Add the people who will be using the chore system.
      </p>
    </div>

    <div className="space-y-4">
      {people.map((person, index) => (
        <PersonForm
          key={index}
          person={person}
          index={index}
          onUpdate={onUpdate}
          onRemove={onRemove}
          canRemove={people.length > 1}
        />
      ))}
    </div>

    <Button
      type="button"
      variant="secondary"
      onClick={onAdd}
      className="w-full"
    >
      Add Another Person
    </Button>

    {error && <ErrorMessage message={error} />}

    <div className="flex space-x-3">
      <Button
        type="button"
        variant="secondary"
        onClick={onBack}
        className="flex-1"
      >
        Back
      </Button>
      <Button type="submit" disabled={loading} className="flex-1">
        {loading ? "Setting up..." : "Complete Setup"}
      </Button>
    </div>
  </form>
);

const SetupWizard: React.FC<SetupWizardProps> = ({ onSetupComplete }) => {
  const [masterPin, setMasterPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [people, setPeople] = useState<Person[]>([
    { name: "", pin: "", isAdmin: false },
  ]);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addPerson = () => {
    setPeople([...people, { name: "", pin: "", isAdmin: false }]);
  };

  const removePerson = (index: number) => {
    if (people.length > 1) {
      setPeople(people.filter((_, i) => i !== index));
    }
  };

  const updatePerson = (
    index: number,
    field: keyof Person,
    value: string | boolean
  ) => {
    const updatedPeople = [...people];
    updatedPeople[index] = { ...updatedPeople[index], [field]: value };
    setPeople(updatedPeople);
  };

  const validateStep1 = () => {
    if (!masterPin.trim()) {
      setError("Master PIN is required");
      return false;
    }
    if (masterPin.length < 4) {
      setError("Master PIN must be at least 4 characters");
      return false;
    }
    if (masterPin !== confirmPin) {
      setError("PINs do not match");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    const validPeople = people.filter((p) => p.name.trim());
    if (validPeople.length === 0) {
      setError("At least one person is required");
      return false;
    }

    // Check for duplicate names
    const names = validPeople.map((p) => p.name.trim().toLowerCase());
    const uniqueNames = new Set(names);
    if (names.length !== uniqueNames.size) {
      setError("Person names must be unique");
      return false;
    }

    return true;
  };

  const handleNext = () => {
    setError("");
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateStep2()) {
      return;
    }

    setLoading(true);

    try {
      const validPeople = people.filter((p) => p.name.trim());

      const response = await apiClient.completeSetup(
        masterPin,
        validPeople.map((p) => ({
          name: p.name.trim(),
          pin: p.pin.trim() || undefined,
          isAdmin: p.isAdmin,
        }))
      );

      if (response.success) {
        onSetupComplete();
      } else {
        setError(response.error || "Setup failed");
      }
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || "Setup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Setting up your family chore system..." />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            ChoresAwards Setup
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Welcome! Let's set up your family chore system
          </p>
        </div>

        <Card>
          <ProgressIndicator currentStep={currentStep} totalSteps={2} />

          {currentStep === 1 ? (
            <Step1
              masterPin={masterPin}
              confirmPin={confirmPin}
              onMasterPinChange={setMasterPin}
              onConfirmPinChange={setConfirmPin}
              onNext={handleNext}
              error={error}
            />
          ) : (
            <Step2
              people={people}
              onUpdate={updatePerson}
              onAdd={addPerson}
              onRemove={removePerson}
              onBack={handleBack}
              onSubmit={handleSubmit}
              loading={loading}
              error={error}
            />
          )}
        </Card>
      </div>
    </div>
  );
};

export default SetupWizard;
