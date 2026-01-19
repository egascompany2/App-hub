import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Pressable,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const CompleteScreen = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Pressable onPress={() => router.replace("/")} hitSlop={8}>
          <Ionicons name="close" size={36} color="#000" />
        </Pressable>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Enjoy your order</Text>

        <Text style={styles.message}>
          Congratulations on receiving your e-gas. We hope it serves you well.
          Always prioritize safety when handling gas. Make sure to follow proper
          usage guidelines. Enjoy your e-gas!
        </Text>

        <View style={styles.imageContainer}>
          <Image
            source={require("@/assets/images/gas-tank.png")}
            style={styles.gasImage}
            resizeMode="contain"
          />
        </View>

        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.replace("/")}
        >
          <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: 40,
  },
  header: {
    padding: 20,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "700",
    color: "#000000",
  },
  imageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  gasImage: {
    width: 300,
    height: 325,
  },
  closeButton: {
    backgroundColor: "#000000",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: "auto",
    marginBottom: 40,
  },
  closeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  scrollViewContent: {
    flexGrow: 1,
  },
});

export default CompleteScreen;
