import { useQuery } from "@tanstack/react-query";
import { driversService } from "@/services/drivers";
import { Button } from "./ui/button";
import { useState } from "react";

interface DriverAssignmentModalProps {
  orderId: string;
  currentDriverName?: string | null;
  onClose: () => void;
  onAssign: (driverId: string) => void;
}

export function DriverAssignmentModal({
  orderId,
  currentDriverName,
  onClose,
  onAssign,
}: DriverAssignmentModalProps) {
  const { data: drivers, isLoading, isError, refetch } = useQuery({
    queryKey: ["available-drivers"],
    queryFn: driversService.getAvailableDrivers,
  });

  const [selectedDriverId, setSelectedDriverId] = useState<string>("");

  const handleAssign = () => {
    if (!selectedDriverId) return;
    onAssign(selectedDriverId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white shadow-xl">
        <div className="flex items-start justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold">Assign Driver</h2>
            <p className="mt-1 text-sm text-gray-500">
              Choose a driver to handle order <span className="font-medium">#{orderId}</span>.
            </p>
            {currentDriverName && (
              <p className="mt-1 text-xs text-gray-500">
                Current driver: <span className="font-semibold">{currentDriverName}</span>
              </p>
            )}
            <p className="mt-2 text-xs text-gray-400">
              Only orders in <span className="font-semibold">PENDING</span>,{" "}
              <span className="font-semibold">ASSIGNED</span>, or{" "}
              <span className="font-semibold">ACCEPTED</span> status can be reassigned.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close assignment modal"
          >
            ✕
          </button>
        </div>

        <div className="max-h-72 overflow-y-auto px-6 py-4">
          {isLoading && (
            <div className="py-6 text-center text-sm text-gray-500">
              Loading available drivers…
            </div>
          )}

          {isError && (
            <div className="flex flex-col items-center gap-3 py-6 text-center text-sm text-red-500">
              <p>Failed to load available drivers.</p>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          )}

          {!isLoading && !isError && !drivers?.length && (
            <div className="py-6 text-center text-sm text-gray-500">
              No drivers are currently available. Please try again later.
            </div>
          )}

          <div className="space-y-2">
            {drivers?.map(driver => (
              <label
                key={driver.id}
                className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition ${
                  selectedDriverId === driver.id
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 hover:border-primary/40"
                }`}
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {driver.name || `${driver.firstName ?? ""} ${driver.lastName ?? ""}`.trim() || "Unnamed driver"}
                  </p>
                  <p className="text-xs text-gray-500">{driver.phoneNumber || driver.phoneNo || "No phone number"}</p>
                </div>
                <input
                  type="radio"
                  name="driver"
                  value={driver.id}
                  checked={selectedDriverId === driver.id}
                  onChange={() => setSelectedDriverId(driver.id)}
                  className="h-4 w-4 text-primary focus:ring-primary"
                />
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t px-6 py-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={!selectedDriverId} onClick={handleAssign}>
            {currentDriverName ? "Reassign Driver" : "Assign Driver"}
          </Button>
        </div>
      </div>
    </div>
  );
}
