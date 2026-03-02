import React from 'react';
import { View } from 'react-native';

// Eye icon component
export const IcEye = () => (
  <View style={{
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#6B7280',
  }} />
);

// Eye off icon component
export const IcEyeOff = () => (
  <View style={{
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#6B7280',
    opacity: 0.5,
  }} />
);
