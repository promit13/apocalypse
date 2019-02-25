import React, { Component } from 'react';
import {
  View, StatusBar, Image,
} from 'react-native';
import { scale, moderateScale } from 'react-native-size-matters';
import Video from 'react-native-video';
import Orientation from 'react-native-orientation';

const video = require('../../assets/astvideo.mp4');

const styles = {
  backgroundVideo: {
    height: '100%',
    width: '100%',
  },
  imageStyle: {
    height: moderateScale(30),
    width: moderateScale(140),
    position: 'absolute',
    alignSelf: 'center',
    bottom: 0,
    marginBottom: moderateScale(10),
  },
  container: {
    flex: 1,
    backgroundColor: '#001331',
  },
};
const imaginactive = require('../../img/imaginactive.png');

export default class Splashscreen extends Component {
  static navigationOptions = () => {
    return {
      header: null,
    };
  };

  renderAstText = () => {
    console.log('IMAGE');
    return (
      <Image
        style={styles.imageStyle}
        resizeMode="stretch"
        resizeMethod="resize"
        source={imaginactive}
      />
    );
  }

  render() {
    Orientation.lockToPortrait();
    return (
      <View style={styles.container}>
        <StatusBar hidden />
        <Video
          source={video}
          ref={(c) => { this.video = c; }}
          resizeMode="cover"
          ignoreSilentSwitch="ignore"
          playInBackground={false}
          style={styles.backgroundVideo}
        />
        <Image
          style={styles.imageStyle}
          resizeMode="stretch"
          resizeMethod="resize"
          source={imaginactive}
        />
      </View>
    );
  }
}
