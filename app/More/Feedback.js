import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-elements';

export default class Feedback extends React.Component {
  static navigationOptions = {
    title: 'Feedbacks',
  };

  render() {
    return (
      <View>
        <Text>
          FEEDBACK
        </Text>
      </View>
    );
  }
}
