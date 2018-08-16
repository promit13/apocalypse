import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-elements';

export default class Agreement extends React.Component {
  static navigationOptions = {
    title: 'Agreement',
  };

  render() {
    return (
      <View>
        <Text>
          AGREEMENT
        </Text>
      </View>
    );
  }
}
