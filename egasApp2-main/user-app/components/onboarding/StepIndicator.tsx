import React from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export const StepIndicator = ({
  currentStep,
  totalSteps = 3, // Only 3 steps
  onPrev,
  onNext,
}: {
  currentStep: number;
  totalSteps?: number;
  onPrev?: () => void;
  onNext?: () => void;
}) => {
  const isPrevDisabled = currentStep === 1;
  const isNextDisabled = !onNext;
  const isLastStep = currentStep === totalSteps;

  return (
    <View style={styles.container}>
      {/* Previous Arrow + Label (side by side) */}
      <View style={styles.arrowWithLabelRow}>
        <TouchableOpacity onPress={onPrev} disabled={isPrevDisabled} style={styles.arrowBtn}>
          <Ionicons name="chevron-back" size={28} color={isPrevDisabled ? '#ccc' : '#000'} />
        </TouchableOpacity>
        <Text style={[styles.arrowLabel, isPrevDisabled && styles.arrowLabelDisabled, {marginLeft: 4}]}>Previous</Text>
      </View>
      {/* Steps */}
      <View style={styles.stepsRow}>
        {Array.from({ length: totalSteps }).map((_, index) => (
          <React.Fragment key={index}>
            <View
              style={[
                styles.step,
                index + 1 === currentStep && styles.currentStep,
                index + 1 < currentStep && styles.completedStep,
              ]}
            >
              {index + 1 < currentStep ? (
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              ) : (
                <Text style={[
                  styles.stepNumber,
                  index + 1 === currentStep && styles.currentStepNumber,
                ]}>{index + 1}</Text>
              )}
            </View>
            {index < totalSteps - 1 && (
              <View
                style={[
                  styles.line,
                  index + 1 < currentStep && styles.completedLine,
                ]}
              />
            )}
          </React.Fragment>
        ))}
      </View>
      {/* Next Arrow + Label (side by side) */}
      <View style={styles.arrowWithLabelRow}>
        <Text style={[styles.arrowLabel, isNextDisabled && styles.arrowLabelDisabled, {marginRight: 4}]}>{isLastStep ? "Finish" : "Next"}</Text>
        <TouchableOpacity
          onPress={onNext}
          disabled={isNextDisabled}
          style={styles.arrowBtn}
        >
          {isLastStep ? (
            <Ionicons name="checkmark-done" size={24} color={onNext ? "#000" : "#ccc"} />
          ) : (
            <Ionicons name="chevron-forward" size={28} color={onNext ? "#000" : "#ccc"} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  stepsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginHorizontal: 4,
  },
  arrowBtn: {
    padding: 4,
    alignItems: 'center',
  },
  arrowWithLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  arrowLabel: {
    fontSize: 13,
    color: '#000',
  },
  arrowLabelDisabled: {
    color: '#ccc',
  },
  step: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#2A2A2A",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E8E8E8",
  },
  currentStep: {
    backgroundColor: "#FFD700",
    borderColor: "#000",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  completedStep: {
    backgroundColor: "#000000",
  },
  stepNumber: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  currentStepNumber: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 15,
  },
  line: {
    width: 18,
    height: 2,
    backgroundColor: "#E8E8E8",
    marginHorizontal: 2,
  },
  completedLine: {
    backgroundColor: "#000000",
  },
});
