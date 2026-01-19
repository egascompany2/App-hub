import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DriverProfile, profileService } from "../services/profile";

export const profileKeys = {
  all: ["profile"] as const,
  details: () => [...profileKeys.all, "details"] as const,
};

export function useProfile() {
  return useQuery<DriverProfile>({
    queryKey: profileKeys.details(),
    queryFn: async () => {
      const data = await profileService.getProfile();
      if (!data) {
        throw new Error('No profile data returned');
      }
      return data;
    },
  });
}

export function useUpdateAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (isAvailable: boolean) => {
      const response = await profileService.updateAvailability(isAvailable);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.details() });
    },
  });
}
