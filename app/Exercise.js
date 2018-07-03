import React, { Component } from 'react';
import {
  View,
} from 'react-native';
import Video from 'react-native-video';
import Controls from './common/Controls';
import TrackDetails from './common/TrackDetails';


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
  },
};


export default class Exercise extends Component {
  constructor(props) {
    super(props);
    this.state = {
      paused: true,
    };
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.containerInner}>
          <Video
            source={{
              uri: this.props.navigation.state.params.exercise.value.videoUrl,
            }}
            ref={(c) => { this.video = c; }}
            paused={this.state.paused}
            resizeMode="cover"
            playInBackground={false}
            style={styles.backgroundVideo}
          />
          <Controls
            onPressPlay={() => this.setState({ paused: false })}
            onPressPause={() => this.setState({ paused: true })}
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
