import React from 'react';
import {
  View, Platform,
} from 'react-native';
import AndroidTrack from './AndroidTrack';
import IosTrack from './IosTrack';

const styles = {
  container: {
    flex: 1,
    padding: 10,
  },
};

export default class Feedback extends React.Component {
  static navigationOptions = {
    title: 'Tracker',
  };

  render() {
    return (
      <View style={styles.container}>
        { Platform.OS === 'android' ? <AndroidTrack /> : <IosTrack /> }
      </View>
    );
  }
}
