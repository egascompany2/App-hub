import { StyleSheet } from "react-native";

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#14181B81",
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    color: "#000000",
    fontWeight: "700",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 8,
    padding: 16,
    color: "#000000",
    fontSize: 16,
  },
  inputGroup: {
    marginBottom: 24,
  },
  navigationButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    width: 56,
    height: 56,
    borderRadius: 22,
    backgroundColor: "#EEEEEE",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    left: 20,
    bottom: 20,
    elevation: 4, // Android shadow
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  nextButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: "#EEEEEE",
    position: "absolute",
    right: 20,
    bottom: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    elevation: 4, // Android shadow
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  nextButtonText: {
    color: "#000000",
    fontSize: 18,
    fontWeight: "700",
  },
  backButtonText: {
    color: "#000000",
    fontSize: 40,
    fontWeight: "600",
    lineHeight: 40,
    alignSelf: "center",
  },
  inputError: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
  },
  inputFocused: {
    borderWidth: 3,
    borderColor: '#000000',
    backgroundColor: '#FFF',
  },
  inputInactive: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#E8E8E8',
  },
});
