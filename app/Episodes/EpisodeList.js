import React from 'react';
import { ScrollView, Text, Button } from 'react-native';
import { ListItem } from 'react-native-elements'

export const EXERCISES =
  {
    benchPress: {
      imageUrl: 'https://content.active.com/Assets/Active.com+Content+Site+Digital+Assets/Running/580/zombies-run.jpg',
      videoUrl: 'http://techslides.com/demos/sample-videos/small.mp4',
      title: 'Bench press',
      start: 0,
      subtitle: 'Lie back on a flat bench. Using a medium width grip (a grip that creates a 90-degree angle in the middle of the movement between the forearms and the upper arms), lift the bar from the rack and hold it straight over you with your arms locked.'
    },
    shoulderPress: {
      imageUrl: 'https://media.giphy.com/media/ASd0Ukj0y3qMM/giphy.gif',
      videoUrl: 'http://mirrors.standaloneinstaller.com/video-sample/Catherine_Part1.mkv',
      title: 'Shoulder press',
      start: 5,
      subtitle: 'Lie back on a flat bench. Using a medium width grip (a grip that creates a 90-degree angle in the middle of the movement between the forearms and the upper arms), lift the bar from the rack and hold it straight over you with your arms locked.'
    },
  };


export const TRACKS = [
  {
    title: 'Zombie training',
    audioUrl: 'https://www.sample-videos.com/audio/mp3/crowd-cheering.mp3',
    exercises: {
      benchPress: 0,
      shoulderPress: 5,
    },
  },
  {
    title: 'Apocalypse monkeys',
    audioUrl: 'https://www.sample-videos.com/audio/mp3/crowd-cheering.mp3',
    exercises: {
      benchPress: 0,
      shoulderPress: 5,
    },
  },
  {
    title: 'Giant squids',
    audioUrl: 'https://www.sample-videos.com/audio/mp3/crowd-cheering.mp3',
    exercises: {
      benchPress: 0,
      shoulderPress: 5,
    },
  },
];

export default class Play extends React.Component {
  constructor() {
    super();
  }



  render() {
    const episodes = Object.entries(TRACKS).map(([key, value], i) => {
      return (
        <ListItem
          key={i}
          title={value.title}
          onPress={() => {
            this.props.navigation.navigate('EpisodeSingle', {
              tracks: TRACKS,
              exercises: EXERCISES,
            })
          }}
        />
      );
    });
    return (
      <ScrollView>
        { episodes }
        <Button 
          title="Navigate"
          onPress={() => {
            this.props.navigation.navigate('EpisodeSingle')
            }}
        />
      </ScrollView>
    );
  }
}
