import React from 'react';
import { TouchableOpacity, Text, Image, StyleSheet } from 'react-native';

interface NextButtonProps {
  onPress: () => void;
  disabled?: boolean;
  style?: any;
  textStyle?: any;
}

export const NextButton = ({ onPress, disabled, style, textStyle }: NextButtonProps) => {
  return (
    <TouchableOpacity 
      style={[
        styles.nextButton,
        disabled && styles.nextButtonDisabled,
        style
      ]} 
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.nextButtonText, textStyle]}>Next</Text>
      <Image 
        source={require('@/assets/icons/arrow-right.png')}
        style={styles.arrow}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: '#000000',
    gap: 8,
    elevation: 4, // Android shadow
    shadowColor: '#000000', // iOS shadow
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  nextButtonDisabled: {
    backgroundColor: '#F5F5F5',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  arrow: {
    width: 20,
    height: 20,
  }
}); 