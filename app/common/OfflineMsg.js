import React from 'react';
import {
  View, Dimensions, StyleSheet,
} from 'react-native';
import { Text } from 'react-native-elements';

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  offlineContainer: {
    backgroundColor: '#b52424',
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    width,
  },
  offlineText: {
    color: '#fff',
  },
});

export default OfflineMsg = () => {
  return (
    <View style={styles.offlineContainer}>
      <Text style={styles.offlineText}>
        No Internet Connection
      </Text>
    </View>
  );
};
