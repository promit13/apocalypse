import React from 'react';
import { ScrollView } from 'react-native';
import { ListItem } from 'react-native-elements';
import firebase from '../config/firebase';

export default class Play extends React.Component {
  state = {
    episodes: '',
  }

  componentDidMount() {
    firebase.database().ref('episodes').on('value', snapshot => this.setState({ episodes: snapshot.val() }));
  }

  render() {
    const { tracks, exercises } = this.props.navigation.state.params;
    const episodesList = Object.entries(this.state.episodes).map(([key, value], i) => {
      return (
        <ListItem
          key={i}
          title={`${i + 1}. ${value.title}`}
          subtitle={value.category}
          titleStyle={{ color: 'white', fontSize: 18 }}
          subtitleStyle={{ color: 'white' }}
          rightIcon={{ name: 'download', type: 'feather', color: 'white' }}
          containerStyle={{ backgroundColor: '#33425a' }}
          underlayColor="#2a3545"
          onPress={() => {
            this.props.navigation.navigate('EpisodeView', {
              tracks,
              exercises,
              title: value.title,
              description: value.description,
              category: value.category,
              index: i + 1,
            });
          }}
        />
      );
    });
    return (
      <ScrollView>
        { episodesList }
      </ScrollView>
    );
  }
}
