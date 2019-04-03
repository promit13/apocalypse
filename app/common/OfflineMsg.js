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
    width,
  },
  offlineText: {
    color: '#fff',
  },
});

export default OfflineMsg = ({ margin, showText }) => {
  return (
    <View style={[styles.offlineContainer, { marginTop: margin }]}>
      <Text style={styles.offlineText}>
        No Internet Connection
      </Text>
      { showText && (
        <Text style={styles.offlineText}>
          Downloaded Episodes Play Offline
        </Text>
      )}
      <View style={{ height: 1, backgroundColor: 'gray' }} />
    </View>
  );
};
