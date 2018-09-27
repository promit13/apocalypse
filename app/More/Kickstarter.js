import React from 'react';
import { View, Platform } from 'react-native';
import { Text, Button } from 'react-native-elements';
import AndroidTrack from './AndroidTrack';
import IosTrack from './IosTrack';

export default class Kickstarter extends React.Component {
  static navigationOptions = {
    title: 'Kick Starters',
  };

  onButtonPressStart = () => {
    this.child.startTrackingSteps();
  }

  onButtonPress = () => {
    this.child.getStepCountAndDistance();
    setTimeout(() => {
      this.getState();
    }, 3000);
  }

  getState = () => {
    const state = this.child.getState();
    console.log('KS', state);
  }

  render() {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        {
          Platform.OS === 'android'
            ? <AndroidTrack ref={c => this.child = c} />
            : <IosTrack ref={c => this.child = c} />
        }
        <Button title="Start" onPress={this.onButtonPressStart} />
        <Button title="End" onPress={this.onButtonPress} />
        <Button title="State" onPress={this.getState} />
      </View>
    );
  }
}
