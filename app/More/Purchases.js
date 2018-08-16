import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-elements';

export default class Purchases extends React.Component {
  static navigationOptions = {
    title: 'Purchases',
  };

  render() {
    return (
      <View>
        <Text>
          PURCHASES
        </Text>
      </View>
    );
  }
}
