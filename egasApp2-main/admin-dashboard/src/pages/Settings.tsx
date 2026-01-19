import { Switch } from "@/components/ui/switch";
import { useState } from "react";

export function Settings() {
  const [autoAssign, setAutoAssign] = useState(true);

  // const updateSettingsMutation = useMutation({
  //   mutationFn: (autoAssign: boolean) => 
  //     adminService.updateSettings({ autoAssignOrders: autoAssign }),
  //   onSuccess: () => {
  //     toast.success("Settings updated successfully");
  //   },
  //   onError: (error) => {
  //     toast.error(error.message);
  //     // Revert switch state on error
  //     setAutoAssign(!autoAssign);
  //   }
  // });

  const handleAutoAssignChange = (checked: boolean) => {
    setAutoAssign(checked);
    // updateSettingsMutation.mutate(checked);
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Settings</h1>
      
      <div className="space-y-4">
        {/* Left sidebar */}
        <div className="flex gap-6">
          <div className="w-[200px] bg-white rounded-lg p-4">
            <div className="space-y-2">
              <h2 className="text-sm font-medium">Order settings</h2>
              <h2 className="text-sm font-medium">Security</h2>
            </div>
          </div>

          {/* Main content */}
          <div className="w-[631px] py-12 px-8 h-[340px] bg-white rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm">Auto assign orders</h2>
                <p className="text-xs text-gray-500 mt-1">Assign orders automatically to drivers</p>
              </div>
              <Switch
                checked={autoAssign}
                onCheckedChange={handleAutoAssignChange}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}