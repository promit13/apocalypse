import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default function Loading() {
  return (
    <View containerStyle={styles.container}>
      <ActivityIndicator size="large" />
    </View>
  );
}
