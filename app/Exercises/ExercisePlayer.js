import React, { Component } from 'react';
import {
  View,
  ScrollView,
} from 'react-native';
import Video from 'react-native-video';
import Controls from '../common/Controls';
import TrackDetails from '../common/TrackDetails';


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
};


export default class Exercise extends Component {
  constructor(props) {
    super(props);
    this.state = {
      paused: false,
    };
  }

  render() {
    const { videoUrl, title } = this.props.navigation.state.params;
    return (
      <ScrollView style={styles.container}>
        <View style={styles.containerInner}>
          <Video
            source={{
              uri: videoUrl,
            }}
            ref={(c) => { this.video = c; }}
            paused={this.state.paused}
            resizeMode="cover"
            playInBackground={false}
            style={styles.backgroundVideo}
          />
          <TrackDetails
            title={title}
          />
          <Controls
            onPressPlay={() => this.setState({ paused: false })}
            onPressPause={() => this.setState({ paused: true })}
            paused={this.state.paused}
          />
        </View>
      </ScrollView>
    );
  }
}
