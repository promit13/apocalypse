import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-elements';

export default class Tips extends React.Component {
  static navigationOptions = {
    title: 'Tips and FAQ',
  };

  render() {
    return (
      <View>
        <Text>
          TIPS AND FAQS
        </Text>
      </View>
    );
  }
}
