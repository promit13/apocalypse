import React from 'react';
import { View, ActivityIndicator } from 'react-native';

const styles = {
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#001331',
  },
};

export default function LoadScreen() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="gray" style={{ marginTop: 20 }} />
    </View>
  );
}
