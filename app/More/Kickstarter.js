import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-elements';

export default class Kickstarter extends React.Component {
  static navigationOptions = {
    title: 'Kick Starters',
  };

  render() {
    return (
      <View>
        <Text>
          KICK STARTER
        </Text>
      </View>
    );
  }
}
