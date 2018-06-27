import React, { Component } from 'react';
import Player from './Player';

export const EXERCISES = 
  {
    benchPress: {
      imageUrl: 'https://techcrunch.com/wp-content/uploads/2018/01/giphy1.gif?w=730&crop=1',
      videoUrl: 'http://techslides.com/demos/sample-videos/small.mp4',
      title: 'Bench press',
      subtitle: 'Lie back on a flat bench. Using a medium width grip (a grip that creates a 90-degree angle in the middle of the movement between the forearms and the upper arms), lift the bar from the rack and hold it straight over you with your arms locked.'
    },
    shoulderPress: {
      imageUrl: 'https://media.giphy.com/media/ASd0Ukj0y3qMM/giphy.gif',
      videoUrl: 'http://mirrors.standaloneinstaller.com/video-sample/Catherine_Part1.mkv',
      title: 'Shoulder press',
      subtitle: 'Lie back on a flat bench. Using a medium width grip (a grip that creates a 90-degree angle in the middle of the movement between the forearms and the upper arms), lift the bar from the rack and hold it straight over you with your arms locked.'
    },
  };


export const TRACKS = [
  {
    title: 'Zombie training',
    workoutImage: "https://pmcdeadline2.files.wordpress.com/2017/12/walking-dead-season-8-fall-finale.jpg?w=446&h=299&crop=1",
    audioUrl: "https://www.sample-videos.com/audio/mp3/crowd-cheering.mp3",
    exercises: {
      benchPress: 0,
      shoulderPress: 5,
    },
  },
];

export default class Play extends Component {
  render() {
    return <Player 
      tracks={TRACKS} 
      exercises={EXERCISES} 
      navigation={this.props.navigation} />
  }
}


