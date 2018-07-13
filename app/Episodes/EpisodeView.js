import React from 'react';
import { ScrollView, View } from 'react-native';
import { ListItem, Button, Text } from 'react-native-elements';

const styles = {
  buttonsContainer: {
    flex: 1,
    flexDirection: 'row',
  },
};

export default class EpisodeView extends React.Component {
  navigateToEpisodeSingle = (check) => {
    const { tracks, exercises } = this.props.navigation.state.params;
    this.props.navigation.navigate('EpisodeSingle', {
      tracks,
      exercises,
      check,
    });
  }

  render() {
    const { exercises } = this.props.navigation.state.params;
    const exercisesList = Object.entries(exercises).map(([key, value], i) => (
      <ListItem
        key={i}
        title={value.title}
        onPress={() => {
          this.props.navigation.navigate('Exercise', {
            videoUrl: value.videoUrl,
            title: value.title,
            subtitle: value.subtitle,
          });
        }}
      />
    ));
    return (
      <ScrollView>
        <View style={styles.buttonsContainer}>
          <Button title="Exercise" onPress={() => this.navigateToEpisodeSingle()} />
          <Button title="Listen" onPress={() => this.navigateToEpisodeSingle(true)} />
        </View>
        <View>
          <Text h2>
            {this.props.navigation.state.params.title}
          </Text>
          <Text>
            {this.props.navigation.state.params.description}
          </Text>
        </View>
        {exercisesList}
      </ScrollView>
    );
  }
}
