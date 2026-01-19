import { create } from "zustand";
import {
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
} from "@/utils/validationSchemas";
import { z } from "zod";
import { authService } from "@/services/auth";
import { tankSizeService, TankSize } from "@/services/tankSize";
import { handleError } from "@/utils/errorHandler";

interface OnboardingState {
  step: number;
  errors: Record<string, string>;
  tankSize: string | null;
  tankSizes: TankSize[];
  isLoadingTankSizes: boolean;
  firstName: string;
  lastName: string;
  email: string;
  streetAddress: string;
  area: string;
  city: string;
  terms: boolean;
  deliveryLatitude: number | null;
  deliveryLongitude: number | null;
  setStep: (step: number) => void;
  setTankSize: (size: string) => void;
  setPersonalInfo: (firstName: string, lastName: string, email: string) => void;
  setDeliveryInfo: (
    streetAddress: string,
    area: string,
    city: string,
    latitude: number | null,
    longitude: number | null
  ) => void;
  setTerms: (accepted: boolean) => void;
  validateCurrentStep: () => boolean;
  setErrors: (errors: Record<string, string>) => void;
  isSubmitting: boolean;
  submitOnboarding: () => Promise<any>;
  fetchTankSizes: () => Promise<void>;
}

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  step: 1,
  errors: {},
  tankSize: null,
  tankSizes: [],
  isLoadingTankSizes: false,
  firstName: "",
  lastName: "",
  email: "",
  streetAddress: "",
  area: "",
  city: "Lagos",
  terms: false,
  deliveryLatitude: null,
  deliveryLongitude: null,
  setStep: (step) => set({ step, errors: {} }),
  setTankSize: (tankSize) => set({ tankSize, errors: {} }),
  setPersonalInfo: (firstName, lastName, email) =>
    set({ firstName, lastName, email, errors: {} }),
  setDeliveryInfo: (streetAddress, area, city, latitude, longitude) =>
    set({
      streetAddress,
      area,
      city,
      deliveryLatitude: latitude,
      deliveryLongitude: longitude,
      errors: {},
    }),
  setTerms: (terms) => set({ terms, errors: {} }),
  setErrors: (errors) => set({ errors }),
  validateCurrentStep: () => {
    const state = get();
    try {
      switch (state.step) {
        case 1:
          step1Schema.parse({ tankSize: state.tankSize });
          break;
        case 2:
          step2Schema.parse({
            firstName: state.firstName,
            lastName: state.lastName,
            email: state.email,
          });
          break;
        case 3:
          // Skip validation for Step 3 to make streetAddress optional
          return true;
        case 4:
          step4Schema.parse({ terms: state.terms });
          break;
      }
      set({ errors: {} });
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.reduce((acc, curr) => {
          const path = curr.path[0] as string;
          acc[path] = curr.message;
          return acc;
        }, {} as Record<string, string>);
        set({ errors });
      }
      return false;
    }
  },
  isSubmitting: false,
  submitOnboarding: async () => {
    const state = get();
    try {
      set({ isSubmitting: true });

      const userData = {
        tankSize: state.tankSize || "",
        firstName: state.firstName.trim(),
        lastName: state.lastName.trim(),
        email: state.email.trim().toLowerCase(),
        address: `${state.streetAddress.trim()}`,
        termsAccepted: state.terms,
        city: state.city.trim(),
        area: state.area.trim(),
        latitude: state.deliveryLatitude !== null ? state.deliveryLatitude : 0,
        longitude: state.deliveryLongitude !== null ? state.deliveryLongitude : 0,
      };

      const response = await authService.updateUserProfile(userData);

      // Reset state only after successful API call
      const initialState = {
        step: 1,
        errors: {},
        tankSize: null,
        firstName: "",
        lastName: "",
        email: "",
        streetAddress: "",
        area: "",
        city: "Lagos",
        terms: false,
        deliveryLatitude: null,
        deliveryLongitude: null,
      };
      set(initialState);

      return response;
    } catch (error) {
      set({
        errors: {
          submit:
            error instanceof Error ? error.message : "Failed to save user data",
        },
      });
      throw error;
    } finally {
      set({ isSubmitting: false });
    }
  },
  fetchTankSizes: async () => {
    try {
      console.log("[OnboardingStore] Starting to fetch tank sizes...");
      set({ isLoadingTankSizes: true });
      const tankSizes = await tankSizeService.getAllTankSizes();
      console.log("[OnboardingStore] Received tank sizes:", tankSizes);
      set({ tankSizes });
      console.log("[OnboardingStore] Tank sizes set in store");
    } catch (error) {
      console.error("[OnboardingStore] Error in fetchTankSizes:", error);
      handleError(error);
      set({ tankSizes: [] });
    } finally {
      set({ isLoadingTankSizes: false });
    }
  },
}));
