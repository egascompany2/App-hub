import React, { useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { useOnboardingStore } from "@/store/onboardingStore";
import { commonStyles } from "./styles";
import { StepIndicator } from "./StepIndicator";
import { TankSize } from "@/services/tankSize";

const OnboardingStep1 = () => {
  const {
    tankSize,
    setTankSize,
    errors,
    tankSizes,
    isLoadingTankSizes,
    fetchTankSizes,
  } = useOnboardingStore();

  useEffect(() => {
    fetchTankSizes();
  }, []);

  const renderTankSizeOption = (size: TankSize) => (
    <TouchableOpacity
      key={size.id}
      style={[
        styles.option,
        tankSize === size.size && styles.selectedOption,
        errors.tankSize ? styles.errorBorder : null,
      ]}
      onPress={() => setTankSize(size.size)}
    >
      <View
        style={[
          styles.radioCircle,
          tankSize === size.size && styles.selectedRadioCircle,
        ]}
      >
        {tankSize === size.size && <View style={styles.radioFill} />}
      </View>
      <View style={styles.optionContent}>
        <Text
          style={[
            styles.optionText,
            tankSize === size.size && styles.selectedOptionText,
          ]}
        >
          {size.size}
        </Text>
        {/* <Text
          style={[
            styles.priceText,
            tankSize === size.size && styles.selectedPriceText,
          ]}
        >
          ₦{size.price.toLocaleString()}
        </Text> */}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={commonStyles.container}>
      <ScrollView style={commonStyles.content}>
        <Text style={commonStyles.title}>Gas Tank</Text>
        <Text style={commonStyles.subtitle}>Select your gas tank size</Text>

        {isLoadingTankSizes ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#000" />
          </View>
        ) : !tankSizes || !Array.isArray(tankSizes) || tankSizes.length === 0 ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              Unable to load tank sizes. Please check your internet connection and try again.
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={fetchTankSizes}
            >
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.optionsGrid}>
            {tankSizes.map(renderTankSizeOption)}
          </View>
        )}

        {/* {errors.tankSize && (
          <Text style={commonStyles.errorText}>{errors.tankSize}</Text>
        )} */}

        <View style={styles.gasTankContainer}>
          <Image
            source={require("@/assets/images/gas-tank.png")}
            style={styles.gasTankImage}
            resizeMode="contain"
          />
          <Text style={styles.gasTankLabel}>
            {tankSize ? tankSize : "Select tank size"}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default OnboardingStep1;

const styles = StyleSheet.create({
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    width: "48%",
    paddingVertical: 12,
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  selectedOption: {
    borderColor: "#000",
    backgroundColor: "#000",
  },
  errorBorder: {
    borderColor: "#FF0000",
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#666",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedRadioCircle: {
    borderColor: "#FFF",
  },
  radioFill: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FFF",
  },
  optionContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  optionText: {
    fontSize: 16,
    color: "#000",
    fontWeight: "500",
  },
  selectedOptionText: {
    color: "#FFF",
  },
  priceText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  selectedPriceText: {
    color: "#FFF",
  },
  gasTankContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 32,
  },
  gasTankImage: {
    width: 150,
    height: 150,
    marginBottom: 8,
  },
  gasTankLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000000",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 32,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#000',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
});
