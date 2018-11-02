import React, { Component } from 'react';
import {
  View, ScrollView,
} from 'react-native';
import RNFetchBlob from 'react-native-fetch-blob';
import Video from 'react-native-video';
import Orientation from 'react-native-orientation';
import Controls from '../common/Controls';
import TrackDetails from '../common/TrackDetails';
import Loading from '../common/Loading';
import LoadScreen from '../common/LoadScreen';

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
    title: '',
    video: '',
    paused: false,
    loading: true,
    loadScreen: true,
  }

  componentDidMount() {
    Orientation.unlockAllOrientations();
    const {
      offline, advance, exerciseTitle, video,
    } = this.props.navigation.state.params;
    if (offline) {
      const formattedExerciseName = exerciseTitle.replace(/\s+/g, '');
      const { dirs } = RNFetchBlob.fs;
      if (advance) {
        this.setState({ video: `${dirs.DocumentDir}/AST/advanceExercises/${formattedExerciseName}.mp4`, title: exerciseTitle, loadScreen: false });
      } else {
        this.setState({ video: `${dirs.DocumentDir}/AST/introExercises/${formattedExerciseName}.mp4`, title: exerciseTitle, loadScreen: false });
      }
    } else {
      this.setState({ video, title: exerciseTitle, loadScreen: false });
    }
  }

  onLoad = () => this.setState({ loading: false });

  onEnd = () => {
    this.setState({ paused: true });
  }

  render() {
    const {
      video, title, loading, loadScreen,
    } = this.state;
    return (
      <ScrollView style={styles.container}>
        <View style={styles.containerInner}>
          { loadScreen
            ? <LoadScreen />
            : (
              <View>
                <Video
                  source={{
                    uri: video,
                  }}
                  ref={(c) => { this.video = c; }}
                  paused={this.state.paused}
                  onLoad={this.onLoad}
                  onEnd={this.onEnd}
                  resizeMode="cover"
                  playInBackground={false}
                  style={styles.backgroundVideo}
                />
                <TrackDetails
                  title={title}
                />
                {
                  loading
                    ? <Loading />
                    : (
                      <Controls
                        onPressPlay={() => this.setState({ paused: false })}
                        onPressPause={() => this.setState({ paused: true })}
                        paused={this.state.paused}
                        exercisePlayer
                      />
                    )
                }
              </View>
            )
          }
        </View>
      </ScrollView>
    );
  }
}
