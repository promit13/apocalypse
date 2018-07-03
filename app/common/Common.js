import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default function Loading() {
  return (
    <View containerStyle={styles.container}>
      <ActivityIndicator size="large" />
    </View>
  );
}
