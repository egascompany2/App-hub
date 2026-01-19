import { useEffect, useState } from "react";
import OnboardingStep1 from "@/components/onboarding/Step1";
import OnboardingStep2 from "@/components/onboarding/Step2";
import OnboardingStep3 from "@/components/onboarding/Step3";
import OnboardingStep4 from "@/components/onboarding/Step4";
import { useOnboardingStore } from "@/store/onboardingStore";
import { useRouter } from "expo-router";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { StepIndicator } from "@/components/onboarding/StepIndicator"; // Import your updated StepIndicator

export default function Onboarding() {
  const router = useRouter();
  const {
    step,
    setStep,
    validateCurrentStep,
    submitOnboarding,
    isSubmitting,
  } = useOnboardingStore();
  const { signIn } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [showFullScreenLoader, setShowFullScreenLoader] = useState(false);

  const handleNext = async () => {
    if (!validateCurrentStep()) return;
    if (step < 3) {
      setStep(step + 1);
    } else {
      setShowModal(true);
    }
  };

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleModalAccept = async () => {
    setShowModal(false); // Hide the modal first
    setShowFullScreenLoader(true);
    try {
      const response = await submitOnboarding();
      if (response.success) {
        await signIn({
          success: response.success,
          message: response.message || "",
          data: {
            user: response.data.user,
            accessToken: response.data.accessToken,
            refreshToken: response.data.refreshToken,
          },
        });
        router.replace("/(tabs)/home");
      }
    } catch (error) {
      console.error("Submit onboarding error:", error);
      router.replace("/(auth)/onboarding");
    } finally {
      setShowFullScreenLoader(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.stepHeader}>
        <StepIndicator
          currentStep={step}
          onPrev={handlePrevious}
          onNext={isSubmitting ? undefined : handleNext}
        />
      </View>

      <View style={styles.content}>
        {step === 1 && <OnboardingStep1 />}
        {step === 2 && <OnboardingStep2 />}
        {step === 3 && <OnboardingStep3 />}
      </View>

      {isSubmitting && (
        <ActivityIndicator size="small" color="#000" style={{ marginBottom: 12 }} />
      )}

      {showModal && (
        <OnboardingStep4
          onAccept={handleModalAccept}
          onCancel={() => setShowModal(false)}
        />
      )}

      {showFullScreenLoader && (
        <View style={styles.fullScreenLoader}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF", // changed to white
  },
  stepHeader: {
    backgroundColor: "#FFFFFF",
    paddingTop: 50,
  },
  content: {
    flex: 1,
    backgroundColor: "#F7F7F7", // subtle difference if needed
  },
  fullScreenLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
});
