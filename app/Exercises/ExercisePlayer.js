import React, { Component } from 'react';
import {
  View, ScrollView,
} from 'react-native';
import Video from 'react-native-video';
import Controls from '../common/Controls';
import TrackDetails from '../common/TrackDetails';
import Loading from '../common/Loading';

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


export default class ExercisePlayer extends Component {
  static navigationOptions = {
    title: 'Exercise Player',
  };

  state = {
    paused: false,
    loading: true,
  }

  onLoad = () => this.setState({ loading: false });

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
            onLoad={this.onLoad}
            resizeMode="cover"
            playInBackground={false}
            style={styles.backgroundVideo}
          />
          { this.state.loading
            ? <Loading />
            : (
              <View>
                <TrackDetails
                  title={title}
                />
                <Controls
                  onPressPlay={() => this.setState({ paused: false })}
                  onPressPause={() => this.setState({ paused: true })}
                  paused={this.state.paused}
                  exercisePlayer
                />
              </View>
            )
          }
        </View>
      </ScrollView>
    );
  }
}
