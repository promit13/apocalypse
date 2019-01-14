import React, { Component } from 'react';
import {
  View, StatusBar,
} from 'react-native';
import Video from 'react-native-video';
import Orientation from 'react-native-orientation';

const video = require('../../assets/astwelcome.mov');

const styles = {
  backgroundVideo: {
    position: 'relative',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    flex: 1,
  },
  imageStyle: {
    height: '100%',
    width: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: '#001331',
  },
  containerInner: {
    marginTop: 90,
  },
  text: {
    color: 'white',
  },
  audioElement: {
    height: 0,
    width: 0,
  },
  modal: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  button: {
    backgroundColor: '#fff',
    borderRadius: 5,
    marginTop: 10,
  },
};


export default class Splashscreen extends Component {
  static navigationOptions = () => {
    return {
      header: null,
    };
  };

  render() {
    Orientation.lockToPortrait();
    return (
      <View style={styles.container}>
        <StatusBar hidden />
        <Video
          source={video}
          ref={(c) => { this.video = c; }}
          resizeMode="cover"
          playInBackground={false}
          style={styles.backgroundVideo}
        />
      </View>
    );
  }
}