import React, { useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useOnboardingStore } from "@/store/onboardingStore";

const Home = () => {
  const router = useRouter();
  const { fetchTankSizes } = useOnboardingStore();

  useEffect(() => {
    fetchTankSizes();
  }, []);

  const handleBuyGas = () => {
    router.push("/order");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        style="dark"
        translucent={true}
        backgroundColor="transparent"
      />
      <View style={styles.mainContent}>
        <Text style={styles.logo}>e-gas</Text>

        <View style={styles.contentContainer}>
          <View style={styles.warningContainer}>
            <Text style={styles.warningText}>Low on gas</Text>
            <Text style={styles.emoji}>😱</Text>
          </View>

          <Image
            source={require("@/assets/images/gas-tank.png")}
            style={styles.gasImage}
            resizeMode="contain"
          />
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.buyButton} onPress={handleBuyGas}>
          <Text style={styles.buyButtonText}>Buy Gas now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  mainContent: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
  },
  logo: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 40,
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 40,
  },
  warningContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    paddingBottom: 4,
  },
  warningText: {
    fontSize: 18,
    fontWeight: "500",
    marginRight: 4,
  },
  emoji: {
    fontSize: 18,
  },
  gasImage: {
    width: 300,
    height: 325.42,
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: 64,
  },
  buyButton: {
    backgroundColor: "#000000",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: "100%",
  },
  buyButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
