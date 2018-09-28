import React from 'react';
import {
  View, Platform, Linking,
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

  componentDidMount() {
    this.sendEmail();
  }

  sendEmail = () => {
    Linking.openURL('mailto:support@example.com?subject=SendMail&body=Description');
  }

  render() {
    return (
      <View style={styles.container}>
        {/* { Platform.OS === 'android' ? <AndroidTrack /> : <IosTrack /> } */}
      </View>
    );
  }
}
