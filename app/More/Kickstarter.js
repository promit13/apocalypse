import React from 'react';
import { View } from 'react-native';
import { Text, Button } from 'react-native-elements';
import AndroidTrack from './AndroidTrack';

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
        <AndroidTrack ref={c => this.child = c} />
        <Button title="Start" onPress={this.onButtonPressStart} />
        <Button title="End" onPress={this.onButtonPress} />
        <Button title="State" onPress={this.getState} />
      </View>
    );
  }
}
