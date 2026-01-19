import { useOnboardingStore } from "@/store/onboardingStore";
import React from "react";
import { View, Text, TextInput, SafeAreaView, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { StepIndicator } from "./StepIndicator";
import { commonStyles } from "./styles";

const OnboardingStep2 = () => {
  const { firstName, lastName, email, setPersonalInfo, errors } =
    useOnboardingStore();
  const [focusedInput, setFocusedInput] = React.useState<string | null>(null);

  const handleChange = (field: string, value: string) => {
    setPersonalInfo(
      field === "firstName" ? value : firstName,
      field === "lastName" ? value : lastName,
      field === "email" ? value : email
    );
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 50}
      >
        <ScrollView 
          style={commonStyles.content} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 50 }}
        >
          <Text style={commonStyles.title}>What's your name</Text>
          <Text style={commonStyles.subtitle}>
            Let's know how to properly address you
          </Text>

          <View style={commonStyles.inputGroup}>
            <Text style={commonStyles.label}>First name</Text>
            <TextInput
              style={[
                commonStyles.input,
                errors.firstName ? commonStyles.inputError : null,
                focusedInput === 'firstName' ? commonStyles.inputFocused : commonStyles.inputInactive,
              ]}
              placeholder="Enter first name"
              placeholderTextColor="#666666"
              value={firstName}
              onChangeText={value => handleChange("firstName", value)}
              onFocus={() => setFocusedInput('firstName')}
              onBlur={() => setFocusedInput(null)}
            />
            {errors.firstName && (
              <Text style={commonStyles.errorText}>{errors.firstName}</Text>
            )}
          </View>

          <View style={commonStyles.inputGroup}>
            <Text style={commonStyles.label}>Last name</Text>
            <TextInput
              style={[
                commonStyles.input,
                errors.lastName ? commonStyles.inputError : null,
                focusedInput === 'lastName' ? commonStyles.inputFocused : commonStyles.inputInactive,
              ]}
              placeholder="Enter last name"
              placeholderTextColor="#666666"
              value={lastName}
              onChangeText={value => handleChange("lastName", value)}
              onFocus={() => setFocusedInput('lastName')}
              onBlur={() => setFocusedInput(null)}
            />
            {errors.lastName && (
              <Text style={commonStyles.errorText}>{errors.lastName}</Text>
            )}
          </View>

          <View style={styles.divider} />

          <View style={commonStyles.inputGroup}>
            <Text style={commonStyles.title}>Add your email address</Text>
            <Text style={commonStyles.subtitle}>Helps with account recovery</Text>
            <Text style={commonStyles.label}>Email</Text>
            <TextInput
              style={[
                commonStyles.input,
                errors.email ? commonStyles.inputError : null,
                focusedInput === 'email' ? commonStyles.inputFocused : commonStyles.inputInactive,
              ]}
              placeholder="Email address"
              placeholderTextColor="#666666"
              keyboardType="email-address"
              value={email}
              onChangeText={value => handleChange("email", value)}
              onFocus={() => setFocusedInput('email')}
              onBlur={() => setFocusedInput(null)}
            />
            {errors.email && (
              <Text style={commonStyles.errorText}>{errors.email}</Text>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default OnboardingStep2;

const styles = StyleSheet.create({
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 20,
  },
  
});
