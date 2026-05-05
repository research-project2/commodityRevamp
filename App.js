import React, { useContext, useEffect, useState } from "react";
import { StyleSheet, ActivityIndicator, View, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import { AuthProvider, AuthContext } from "./src/context/SimpleAuthContext";
import { RootNavigator } from "./src/routes";

const toastConfig = {
  success: (props) => (
    <View style={{ marginHorizontal: 10 }}>
      <View style={{
        backgroundColor: '#fff',
        borderLeftWidth: 4,
        borderLeftColor: "#22c55e",
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: '#1f2937' }}>✓ {props.text1}</Text>
        {props.text2 && (
          <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{props.text2}</Text>
        )}
      </View>
    </View>
  ),

  error: (props) => (
    <View style={{ marginHorizontal: 10 }}>
      <View style={{
        backgroundColor: '#fff',
        borderLeftWidth: 4,
        borderLeftColor: "#ef4444",
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: '#1f2937' }}>✕ {props.text1}</Text>
        {props.text2 && (
          <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{props.text2}</Text>
        )}
      </View>
    </View>
  ),

  info: (props) => (
    <View style={{ marginHorizontal: 10 }}>
      <View style={{
        backgroundColor: '#fff',
        borderLeftWidth: 4,
        borderLeftColor: "#3b82f6",
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: '#1f2937' }}>ℹ {props.text1}</Text>
        {props.text2 && (
          <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{props.text2}</Text>
        )}
      </View>
    </View>
  ),
};

const AppContent = () => {
  const { isLoggedIn, loading } = useContext(AuthContext);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (!isReady || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1ABC9C" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <NavigationContainer>
          <RootNavigator isLoggedIn={isLoggedIn} />
        </NavigationContainer>
      </SafeAreaProvider>

      {/* Toast harus child terakhir, di luar SafeAreaProvider & NavigationContainer */}
      <Toast config={toastConfig} position="top" topOffset={50} />
    </GestureHandlerRootView>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});