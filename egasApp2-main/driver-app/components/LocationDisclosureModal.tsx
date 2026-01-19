import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from "react-native";

type Props = {
  visible: boolean;
  onContinue: () => void;
  onDecline: () => void;
  isRequesting?: boolean;
};

export const LocationDisclosureModal: React.FC<Props> = ({
  visible,
  onContinue,
  onDecline,
  isRequesting = false,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onDecline}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.eyebrow}>Required disclosure</Text>
            <Text style={styles.title}>Allow precise location?</Text>
          </View>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.lead}>
              We collect your precise device location to enable delivery tracking and fulfill orders.
            </Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>
                • What: precise device location.
              </Text>
              <Text style={styles.listItem}>
                • Why: to track deliveries, assign orders, and provide accurate ETAs.
              </Text>
              <Text style={styles.listItem}>
                • When: while you use the app and when it runs in the background or is closed, to keep active deliveries updated.
              </Text>
            </View>
          </ScrollView>
          <View style={styles.actions}>
          <TouchableOpacity style={styles.secondaryButton} onPress={onDecline}>
              <Text style={styles.secondaryText}>Decline</Text>
          </TouchableOpacity>
            <TouchableOpacity
              style={[styles.primaryButton, isRequesting && { opacity: 0.7 }]}
              onPress={onContinue}
              disabled={isRequesting}
            >
              {isRequesting && <ActivityIndicator color="#fff" size="small" />}
              <Text style={styles.primaryText}>Continue / Allow</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  card: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 8,
    elevation: 6,
  },
  header: {
    gap: 4,
    marginBottom: 8,
  },
  eyebrow: {
    color: "#6B7280",
    textTransform: "uppercase",
    fontSize: 12,
    letterSpacing: 0.6,
    fontWeight: "700",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0A0A0A",
  },
  content: {
    gap: 10,
  },
  lead: {
    fontSize: 15,
    color: "#1f1f1f",
    lineHeight: 22,
  },
  list: {
    gap: 6,
  },
  listItem: {
    fontSize: 14,
    color: "#2f2f2f",
    lineHeight: 20,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "#000",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  primaryText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  secondaryText: {
    color: "#111827",
    fontWeight: "700",
    fontSize: 15,
  },
});
