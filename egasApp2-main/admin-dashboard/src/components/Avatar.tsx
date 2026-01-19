import { Button } from "@/components/ui/button";
import { LogOutIcon } from "lucide-react";
import { authService } from "@/services/auth";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export function AvatarComponent() {
  const navigate = useNavigate();

  const handleLogout = () => {
    try {
      authService.logout();
      navigate("/login");
      toast.success("Logged out successfully");
    } catch (error) {
      console.log(error);
      toast.error("Failed to logout. Please try again.");
    }
  };

  return (
    <Button
      onClick={handleLogout}
      variant="destructive"
      className="w-full justify-start"
    >
      <LogOutIcon className="w-4 h-4" />
      Logout
    </Button>
  );
}
