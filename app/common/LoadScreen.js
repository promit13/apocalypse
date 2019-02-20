import React from 'react';
import {
  View, ActivityIndicator, StatusBar, Text,
} from 'react-native';
import { moderateScale } from 'react-native-size-matters';

const styles = {
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#001331',
  },
  text: {
    color: 'white',
    alignSelf: 'center',
    paddingBottom: moderateScale(10),
    fontSize: moderateScale(16),
  },
};

const screenMessage = [
  'Connecting to TALON',
  'One moment, Risky',
  'Establishing connection',
];

export default function LoadScreen({ text }) {
  return (
    <View style={styles.container}>
      <StatusBar
        hidden
      />
      <Text style={styles.text}>
        {text ? text : screenMessage[Math.floor(Math.random() * screenMessage.length)]}
      </Text>
      <ActivityIndicator size="large" color="gray" style={{ marginTop: 20 }} />
    </View>
  );
}
