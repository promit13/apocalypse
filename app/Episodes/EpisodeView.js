import React from 'react';
import { ScrollView, Text } from 'react-native';
import { ListItem } from 'react-native-elements'

export default class EpisodeView extends React.Component {
  constructor() {
    super();
  }

  render() {
    return (
      <ScrollView>
        <Text> EpisodeView </Text>
      </ScrollView>
    );
  }
}
