import React, { Component } from 'react';
import {
  View,
  Text,
  StatusBar,
} from 'react-native';
import Video from 'react-native-video';
import Controls from './Controls';
import TrackDetails from './TrackDetails';


export default class Exercise extends Component {
  constructor(props) {
    super(props);
    this.state = {
      paused: true,
      totalLength: 1,
      currentTime: 0.0,
    };

  }

  setDuration(data) {
    // console.log(totalLength);
    this.setState({totalLength: Math.floor(data.duration)});
  }

  setTime(data) {
    //console.log(data);
    this.setState({currentPosition: Math.floor(data.currentTime)});
  }

  seek(time) {
    time = Math.round(time);
    this.refs.audioElement && this.refs.audioElement.seek(time);
    this.setState({
      currentPosition: time,
      paused: false,
    });
    this.player.seek(0)

  }


  render() {
    return (
      <View style={styles.container}>
        <View style={styles.containerInner} >
          <Video source={{uri: this.props.navigation.state.params.exercise.value.videoUrl}} // Can be a URL or a local file.
          ref="audioElement"
          paused={this.state.paused}               // Pauses playback entirely.
          resizeMode="cover"           // Fill the whole screen at aspect ratio.
          playInBackground={false}
          style={styles.backgroundVideo} 
          />
          
          <Controls
            onPressPlay={() => this.setState({paused: false})}
            onPressPause={() => this.setState({paused: true})}
            paused={this.state.paused}
          />
          <TrackDetails 
            title={this.props.navigation.state.params.exercise.value.title} 
            artist={this.props.navigation.state.params.exercise.value.subtitle}
          />

        </View>
      </View>
    );
  }
}

const styles = {
  backgroundVideo: {
    position: 'relative',
    top: 0,
    height: 200,
    left: 0,
    bottom: 0,
    right: 0,
  },
  container: {
    flex: 1,
    backgroundColor: 'rgb(4,4,4)',
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
  }
};
