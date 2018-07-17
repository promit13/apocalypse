import React from 'react';
import { ScrollView } from 'react-native';
import { ListItem } from 'react-native-elements';

export default class Play extends React.Component {
  render() {
    const { tracks, exercises } = this.props.navigation.state.params;
    const episodes = Object.entries(tracks).map(([key, value], i) => {
      return (
        <ListItem
          key={i}
          title={value.title}
          onPress={() => {
            this.props.navigation.navigate('EpisodeView', {
              tracks,
              exercises,
              title: value.title,
              description: value.description,
            });
          }}
        />
      );
    });
    return (
      <ScrollView>
        { episodes }
      </ScrollView>
    );
  }
}
