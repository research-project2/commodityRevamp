import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';

const Footer = ({ onPress }) => (
  <View style={styles.container}>
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>Kembali ke Laman Utama</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: 'transparent',
  },
  button: {
    backgroundColor: '#0B3977',
    borderWidth: 2,
    borderColor: '#054783',
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '400',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default Footer;