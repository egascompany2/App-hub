import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  LayoutChangeEvent,
} from "react-native";

interface OnboardingStep4Props {
  onAccept: () => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const OnboardingStep4: React.FC<OnboardingStep4Props> = ({
  onAccept,
  onCancel,
  isSubmitting = false,
}) => {
  // Always allow proceeding
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(true);
  const [containerHeight, setContainerHeight] = useState<number>(0);

  const handleScroll = (_: any) => {
    // No-op; accept is always enabled
  };

  const handleContainerLayout = (e: LayoutChangeEvent) => {
    setContainerHeight(e.nativeEvent.layout.height);
  };

  const handleContentSizeChange = (_: number, __: number) => {
    // No-op; accept is always enabled
  };

  return (
    <Modal transparent animationType="fade" visible onRequestClose={onCancel}>
      <SafeAreaView style={styles.overlay}>
        <View style={styles.dialog}>
          <View style={styles.header}>
            <Text style={styles.title}>Terms & Conditions</Text>
            <Text style={styles.subtitle}>Please read and accept our terms</Text>
          </View>

          {/* Top action bar */}
          <View style={styles.topActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelButtonText}>Decline</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.acceptButton}
              onPress={onAccept}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.acceptButtonText}>Accept & Continue</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator
            persistentScrollbar
            onScroll={handleScroll}
            onContentSizeChange={handleContentSizeChange}
            scrollEventThrottle={16}
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
            bounces
            overScrollMode="always"
            contentInsetAdjustmentBehavior="automatic"
            onLayout={handleContainerLayout}
          >
              <View>
                {/* Privacy Policy Section */}
                <Text style={styles.sectionTitle}>1. Privacy Policy – eGas Limited</Text>
                <Text style={styles.effectiveDate}>Effective Date: 05/08/2025</Text>

                <Text style={styles.subsectionTitle}>1.1 Introduction</Text>
                <Text style={styles.paragraph}>
                  eGas Limited ("we," "our," "us") respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, store, and share your information when you use our mobile application, website, and related services (collectively, the "Platform").
                </Text>
                <Text style={styles.paragraph}>
                  By using our Platform, you agree to the practices described in this Privacy Policy.
                </Text>

                <Text style={styles.subsectionTitle}>1.2 Information We Collect</Text>
                <Text style={styles.paragraph}>We may collect the following information:</Text>
                <Text style={styles.bulletPoint}>• Personal Identification: Name, phone number, email address, and delivery address.</Text>
                <Text style={styles.bulletPoint}>• Device Information: Device type, operating system, and unique device identifiers.</Text>
                <Text style={styles.bulletPoint}>• Location Information: GPS coordinates or address for delivery purposes.</Text>
                <Text style={styles.bulletPoint}>• Transaction Information: Payment details, order history, and gas cylinder size.</Text>
                <Text style={styles.bulletPoint}>• Usage Data: Pages visited, features used, and time spent on the Platform.</Text>

                <Text style={styles.subsectionTitle}>1.3 How We Use Your Information</Text>
                <Text style={styles.paragraph}>We use your information to:</Text>
                <Text style={styles.bulletPoint}>• Process and deliver your orders.</Text>
                <Text style={styles.bulletPoint}>• Assign orders to the nearest delivery personnel.</Text>
                <Text style={styles.bulletPoint}>• Improve and personalize your experience.</Text>
                <Text style={styles.bulletPoint}>• Ensure safety, maintenance, and timely replacement of LPG cylinders.</Text>
                <Text style={styles.bulletPoint}>• Comply with legal and regulatory requirements.</Text>

                <Text style={styles.subsectionTitle}>1.4 Sharing of Information</Text>
                <Text style={styles.paragraph}>We may share your information with:</Text>
                <Text style={styles.bulletPoint}>• Delivery Personnel: To complete your orders.</Text>
                <Text style={styles.bulletPoint}>• Service Providers: Payment processors, cloud storage, and mapping services.</Text>
                <Text style={styles.bulletPoint}>• Regulatory Authorities: When required by law.</Text>
                <Text style={styles.bulletPoint}>• Business Partners: For promotions or joint services (with your consent).</Text>
                <Text style={styles.paragraph}>We do not sell your personal information to third parties.</Text>

                <Text style={styles.subsectionTitle}>1.5 Data Retention</Text>
                <Text style={styles.paragraph}>
                  We retain your personal data as long as your account is active or as needed to provide services, comply with laws, resolve disputes, and enforce agreements.
                </Text>

                <Text style={styles.subsectionTitle}>1.6 Security</Text>
                <Text style={styles.paragraph}>
                  We implement industry-standard measures to protect your information but cannot guarantee 100% security due to the nature of the internet.
                </Text>

                <Text style={styles.subsectionTitle}>1.7 Your Rights</Text>
                <Text style={styles.paragraph}>You may:</Text>
                <Text style={styles.bulletPoint}>• Access, update, or delete your personal data.</Text>
                <Text style={styles.bulletPoint}>• Withdraw consent for certain data uses.</Text>
                <Text style={styles.bulletPoint}>• Request a copy of your data.</Text>

                <Text style={styles.subsectionTitle}>1.8 Changes to This Policy</Text>
                <Text style={styles.paragraph}>
                  We may update this Privacy Policy at any time. Continued use of the Platform after updates means you accept the changes.
                </Text>

                <Text style={styles.subsectionTitle}>1.9 Contact Us</Text>
                <Text style={styles.paragraph}>eGas Limited</Text>
                <Text style={styles.paragraph}>Email: support@egascompany.com</Text>
                <Text style={styles.paragraph}>Website: www.egascompany.com</Text>

                {/* Terms of Use Section */}
                <Text style={styles.sectionTitle}>2. Terms of Use – eGas Limited</Text>
                <Text style={styles.effectiveDate}>Effective Date: 05/08/2025</Text>

                <Text style={styles.subsectionTitle}>2.1 Acceptance of Terms</Text>
                <Text style={styles.paragraph}>
                  By using the eGas mobile application, website, and related services ("Platform"), you agree to these Terms of Use. If you do not agree, do not use the Platform.
                </Text>

                <Text style={styles.subsectionTitle}>2.2 Services Provided</Text>
                <Text style={styles.paragraph}>
                  eGas provides a gas delivery service where users can order through the Platform. All cylinders are owned by eGas and swapped upon each refill request.
                </Text>

                <Text style={styles.subsectionTitle}>2.3 Eligibility</Text>
                <Text style={styles.paragraph}>You must:</Text>
                <Text style={styles.bulletPoint}>• Be at least 18 years old or have parental/guardian consent.</Text>
                <Text style={styles.bulletPoint}>• Provide accurate personal and delivery information.</Text>
                <Text style={styles.bulletPoint}>• Have a compatible device and internet connection.</Text>

                <Text style={styles.subsectionTitle}>2.4 Orders & Payments</Text>
                <Text style={styles.bulletPoint}>• All orders are placed through the Platform.</Text>
                <Text style={styles.bulletPoint}>• Prices are displayed at checkout and may include cylinder usage costs.</Text>
                <Text style={styles.bulletPoint}>• Payments must be made via the available payment methods before delivery is confirmed.</Text>
                <Text style={styles.bulletPoint}>• Failed payments will result in order cancellation.</Text>

                <Text style={styles.subsectionTitle}>2.5 Delivery & Cylinder Ownership</Text>
                <Text style={styles.bulletPoint}>• All LPG cylinders remain the property of eGas.</Text>
                <Text style={styles.bulletPoint}>• Upon each refill, the empty cylinder will be collected, and a filled one will be delivered.</Text>
                <Text style={styles.bulletPoint}>• Users must return the company-owned cylinder in good condition.</Text>
                <Text style={styles.bulletPoint}>• Damaged or lost cylinders may result in a replacement fee.</Text>

                <Text style={styles.subsectionTitle}>2.6 Safety Compliance</Text>
                <Text style={styles.bulletPoint}>• Cylinders must only be used for their intended purpose and handled safely.</Text>
                <Text style={styles.bulletPoint}>• eGas may inspect cylinders periodically.</Text>
                <Text style={styles.bulletPoint}>• Users must not tamper with safety seals or modify cylinders.</Text>

                <Text style={styles.subsectionTitle}>2.7 Prohibited Uses</Text>
                <Text style={styles.paragraph}>You agree not to:</Text>
                <Text style={styles.bulletPoint}>• Provide false information.</Text>
                <Text style={styles.bulletPoint}>• Use the Platform for unlawful purposes.</Text>
                <Text style={styles.bulletPoint}>• Interfere with Platform operations or misuse any features.</Text>

                <Text style={styles.subsectionTitle}>2.8 Limitation of Liability</Text>
                <Text style={styles.paragraph}>eGas is not responsible for:</Text>
                <Text style={styles.bulletPoint}>• Losses due to user negligence.</Text>
                <Text style={styles.bulletPoint}>• Delays caused by factors outside our control.</Text>
                <Text style={styles.bulletPoint}>• Damages arising from unsafe storage or handling of LPG after delivery.</Text>

                <Text style={styles.subsectionTitle}>2.9 Account Termination</Text>
                <Text style={styles.paragraph}>
                  We may suspend or terminate your account for violations of these Terms.
                </Text>

                <Text style={styles.subsectionTitle}>2.10 Governing Law</Text>
                <Text style={styles.paragraph}>
                  These Terms are governed by the laws of the Federal Republic of Nigeria.
          </Text>

                <Text style={styles.subsectionTitle}>2.11 Contact Us</Text>
                <Text style={styles.paragraph}>eGas Limited</Text>
                <Text style={styles.paragraph}>Email: support@egascompany.com</Text>
                <Text style={styles.paragraph}>Website: www.egascompany.com</Text>
              </View>
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelButtonText}>Decline</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.acceptButton}
              onPress={onAccept}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.acceptButtonText}>Accept & Continue</Text>
              )}
            </TouchableOpacity>
          </View>
          {/* Bottom spacer removed; actions shown at top */}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  dialog: {
    backgroundColor: "#fff",
    width: "92%",
    maxWidth: 520,
    maxHeight: "90%",
    borderRadius: 12,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    overflow: "hidden",
    flexDirection: "column",
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  topActions: {
    flexDirection: "row",
    justifyContent: "space_between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    color: "#000",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    color: "#666",
  },
  scrollContainer: {
    flexGrow: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginTop: 20,
    marginBottom: 8,
  },
  effectiveDate: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
    marginBottom: 16,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginTop: 16,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
    marginBottom: 12,
  },
  bulletPoint: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
    marginBottom: 6,
    paddingLeft: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
    gap: 12,
    display: "none",
  },
  cancelButton: {
    paddingVertical: 12,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    flex: 1,
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  acceptButton: {
    paddingVertical: 12,
    backgroundColor: "#000",
    borderRadius: 8,
    flex: 1,
  },
  acceptButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default OnboardingStep4;
