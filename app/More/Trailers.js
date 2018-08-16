import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-elements';

export default class Trailers extends React.Component {
  static navigationOptions = {
    title: 'Trailers',
  };

  render() {
    return (
      <View>
        <Text>
          TRAILERS
        </Text>
      </View>
    );
  }
}
