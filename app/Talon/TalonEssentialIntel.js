import React from 'react';
import { ScrollView } from 'react-native';
import { ListItem } from 'react-native-elements';
import firebase from '../config/firebase';

export const EXERCISES = {
  benchPress: {
    imageUrl: 'https://content.active.com/Assets/Active.com+Content+Site+Digital+Assets/Running/580/zombies-run.jpg',
    videoUrl: 'http://techslides.com/demos/sample-videos/small.mp4',
    title: 'Bench press',
    start: 0,
    subtitle: 'Lie back on a flat bench. Using a medium width grip (a grip that creates a 90-degree angle in the middle of the movement between the forearms and the upper arms), lift the bar from the rack and hold it straight over you with your arms locked.',
  },
  shoulderPress: {
    imageUrl: 'https://media.giphy.com/media/ASd0Ukj0y3qMM/giphy.gif',
    videoUrl: 'http://mirrors.standaloneinstaller.com/video-sample/Catherine_Part1.mkv',
    title: 'Shoulder press',
    start: 5,
    subtitle: 'Lie back on a flat bench. Using a medium width grip (a grip that creates a 90-degree angle in the middle of the movement between the forearms and the upper arms), lift the bar from the rack and hold it straight over you with your arms locked.',
  },
};

export const TRACKS = [
  {
    title: 'Zombie training',
    description: 'Lie back on a flat bench. Using a medium width grip (a grip that creates a 90-degree angle in the middle of the movement between the forearms and the upper arms), lift the bar from the rack and hold it straight over you with your arms locked.',
    audioUrl: 'https://www.sample-videos.com/audio/mp3/crowd-cheering.mp3',
    exercises: {
      benchPress: 0,
      shoulderPress: 5,
    },
  },
  {
    title: 'Apocalypse monkeys',
    description: 'Lie back on a flat bench. Using a medium width grip (a grip that creates a 90-degree angle in the middle of the movement between the forearms and the upper arms), lift the bar from the rack and hold it straight over you with your arms locked.',
    audioUrl: 'https://www.sample-videos.com/audio/mp3/crowd-cheering.mp3',
    exercises: {
      benchPress: 0,
      shoulderPress: 5,
    },
  },
  {
    title: 'Giant squids',
    description: 'Lie back on a flat bench. Using a medium width grip (a grip that creates a 90-degree angle in the middle of the movement between the forearms and the upper arms), lift the bar from the rack and hold it straight over you with your arms locked.',
    audioUrl: 'https://www.sample-videos.com/audio/mp3/crowd-cheering.mp3',
    exercises: {
      benchPress: 0,
      shoulderPress: 5,
    },
  },
];
export default class EssentialIntel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      episodes: '',
    };
  }

  componentDidMount() {
    firebase.database().ref('episodes').on('value', snapshot => this.setState({ episodes: snapshot.val() }));
  }

  render() {
    const seasons = Object.entries(this.state.episodes).map(([key, value], i) => {
      return (
        <ListItem
          key={key}
          title={value.title}
          onPress={() => {
            this.props.navigation.navigate('TalonIntelPlayer', {
              tracks: TRACKS,
              exercises: EXERCISES,
            });
          }}
        />
      );
    });
    return (
      <ScrollView>
        { seasons }
      </ScrollView>
    );
  }
}
