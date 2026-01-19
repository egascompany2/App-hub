import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Linking, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const WHATSAPP_NUMBER = "2347034528526"; // Replace with your support number
const WHATSAPP_MESSAGE = encodeURIComponent("Hello, I need support regarding my e-gas account.");
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`;

export default function SupportPage() {
  const openWhatsApp = async () => {
    const supported = await Linking.canOpenURL(WHATSAPP_URL);
    if (supported) {
      await Linking.openURL(WHATSAPP_URL);
    } else {
      alert("WhatsApp is not installed or cannot be opened.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Support</Text>
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>For Enquiries, Complaints, or Tank Size Change, please contact us on WhatsApp.</Text>
      </View>
      <TouchableOpacity style={styles.whatsappButton} onPress={openWhatsApp}>
        {/* Use a real WhatsApp icon in production. For now, Ionicons logo-whatsapp */}
        <Ionicons name="logo-whatsapp" size={28} color="#25D366" style={{ marginRight: 8 }} />
        <Text style={styles.whatsappText}>Chat with us on WhatsApp</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#276EF1',
  },
  infoBox: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 20,
    marginBottom: 32,
    width: '100%',
  },
  infoText: {
    fontSize: 16,
    color: '#222',
    textAlign: 'center',
  },
  whatsappButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  whatsappText: {
    fontSize: 17,
    color: '#25D366',
    fontWeight: '600',
  },
});