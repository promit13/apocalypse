import React, { Component } from 'react';
import Player from './Player';

export const GIFS = 
  {
    exercise1: {
      startTime: 0,
      url: 'https://techcrunch.com/wp-content/uploads/2018/01/giphy1.gif?w=730&crop=1',
    },
    exercise2: {
      startTime: 5,
      url: 'https://media.giphy.com/media/ASd0Ukj0y3qMM/giphy.gif',
    },
  };

export const TRACKS = [
  {
    title: 'Stressed Out',
    artist: 'Twenty One Pilots',
    albumArtUrl: "http://36.media.tumblr.com/14e9a12cd4dca7a3c3c4fe178b607d27/tumblr_nlott6SmIh1ta3rfmo1_1280.jpg",
    audioUrl: "https://www.sample-videos.com/audio/mp3/crowd-cheering.mp3",
  },
  {
    title: 'Love Yourself',
    artist: 'Justin Bieber',
    albumArtUrl: "http://arrestedmotion.com/wp-content/uploads/2015/10/JB_Purpose-digital-deluxe-album-cover_lr.jpg",
    audioUrl: 'https://www.sample-videos.com/audio/mp3/crowd-cheering.mp3',
  },
  {
    title: 'Hotline Bling',
    artist: 'Drake',
    albumArtUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c9/Drake_-_Hotline_Bling.png',
    audioUrl: 'http://1604ent.com/wp-content/uploads/2018/01/Drake_-_Gods_Plan_1604Ent.com.mp3',
  },
];

export default class Play extends Component {
  render() {
    return <Player tracks={TRACKS} gifs={GIFS} />
  }
}


