import React, { Component } from 'react';
import {
  ActivityIndicator,
  AppState,
  Text,
  View,
} from 'react-native';
import Video from 'react-native-video';
import firebase from '../config/firebase';
import AlbumArt from '../common/AlbumArt';
import TrackDetails from '../common/TrackDetails';
import Controls from '../common/Controls';
import Seekbar from '../common/Seekbar';

const styles = {
  container: {
    flex: 1,
    backgroundColor: 'rgb(4,4,4)',
  },
  containerInner: {
    marginTop: 90,
  },
  text: {
    color: 'white',
    textAlign: 'center',
    marginTop: 20,
  },
  loading: {
    marginTop: 30,
  },
  audioElement: {
    height: 0,
    width: 0,
  },
};

export default class TalonIntelPlayer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      paused: true,
      totalLength: 1,
      currentTime: 0.0,
      selectedTrack: 0,
      playingExercise: '',
    };
    this.getTimeFirebase = this.getTimeFirebase.bind(this);
    this.onPressPlay = this.onPressPlay.bind(this);
    this.onPressPause = this.onPressPause.bind(this);
    this.onBack = this.onBack.bind(this);
    this.onForward = this.onForward.bind(this);
    this.onExercisePress = this.onExercisePress.bind(this);
    this.onDragSeekBar = this.onDragSeekBar.bind(this);
  }

  componentDidMount() {
    const firstExercise = Object.entries(this.props.navigation.state.params.exercises)
      .map(([exercise, value], i) => {
        i === 0
          ? this.setState({
            playingExercise: {name: exercise, value: value}
          })
          : null;
      });
    this.getTimeFirebase() !== 0
      ? this.setState({ currentTime: this.getTimeFirebase() })
      : null;
    this.getTimeFirebase();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.currentTime > 0) {
      this.changeExercises;
    }
  }

  onBack() {
    const SEEK_BEHIND = 15;
    this.setState({ currentTime: this.state.currentTime - SEEK_BEHIND });
    this.player.seek(this.state.currentTime - SEEK_BEHIND, 10);
  }

  onForward() {
    const SEEK_FORWARD = 15;
    this.setState({ currentTime: this.state.currentTime + SEEK_FORWARD });
    this.player.seek(this.state.currentTime + SEEK_FORWARD, 10);
  }

  onPressPause() {
    this.setState({ paused: true });
    firebase.database().ref('videos/example').set({
      timeStamp: this.state.currentTime,
    });
    this.changeExercises();
  }

  onExercisePress() {
    this.props.navigation.navigate('Exercise', { exercise: this.state.playingExercise });
    this.setState({ paused: true });
    firebase.database().ref('videos/example').set({
      timeStamp: this.state.currentTime,
    });
  }

  onAppStateChange = (nextAppState) => {
    if (nextAppState === 'background') {
    }
  }

  onProgress = (data) => {
    this.setState({ currentTime: data.currentTime });

    AppState.addEventListener('change', (state) => {
      if (state === 'background') {
        this.setTimeFirebase();
      }
    });
  };

  onLoad = (data) => {
    this.setState({ totalLength: data.duration });
    const firebaseTime = firebase.database().ref('videos/example').on('value', (snapshot) => {
      this.setState({ currentTime: this.getCurrentTimeInMs(snapshot.val().timeStamp) },
        function () {
          this.changeExercises();
          this.player.seek(this.state.currentTime, 10);
        });
    }, (error) => {
    });
    this.setState({ loading: false }); 
  };

  onDragSeekBar(currentTime) {
    this.player.seek(currentTime, 10);
  }

  onPressPlay() {
    this.setState({ paused: false });
  }

  setTime(data) {
    this.setState({ currentPosition: Math.floor(data.currentTime) });
  }

  getCurrentTimeInMs = time => parseInt(time, 10);

  setTimeFirebase() {
    firebase.database().ref('videos/example').set({
      timeStamp: this.state.currentTime,
    });
  }

  getTimeFirebase() {
    firebase.database().ref('videos/example').on(
      'value', (snapshot) => snapshot.val(),
      (error) => {
        console.log(error);
      },
    );
  }

  changeExercises() {
    const exercises = Object.entries(this.props.navigation.state.params.exercises)
      .map(([key, value], i) => {
        if (this.state.currentTime > value.start) {
          this.setState({
            playingExercise: {
              name: key,
              value,
            },
          });
        }
      });
  }

  render() {
    const track = this.props.navigation.state.params.tracks[this.state.selectedTrack];
    const video = (
      <Video
        source={{ uri: track.audioUrl }} // Can be a URL or a local file.
        ref={(ref) => {
          this.player = ref
        }}
        progressUpdateInterval={100.0}
        paused={this.state.paused} // Pauses playback entirely.
        resizeMode="cover" // Fill the whole screen at aspect ratio.
        playInBackground={true}
        onLoad={this.onLoad}
        onProgress={this.onProgress}
        style={styles.audioElement}
      />
    );

    return (
      <View style={styles.container}>
        {this.showSeekbar}
        <View style={styles.containerInner}>
          <AlbumArt
            url={
              this.state.playingExercise
                ? this.state.playingExercise.value.imageUrl
                : track.workoutImage
            }
            onPress={this.onExercisePress}
          />
          { this.state.loading
            ? <ActivityIndicator size="large" color="white" style={styles.loading} />
            : (
              <View>
                <Controls
                  onPressPlay={this.onPressPlay}
                  onPressPause={this.onPressPause}
                  onBack={this.onBack}
                  onForward={this.onForward}
                  onDownload={this.onDownload}
                  paused={this.state.paused}
                />
                <Seekbar
                  totalLength={this.state.totalLength}
                  onDragSeekBar={this.onDragSeekBar}
                  seekValue={this.state.currentTime && this.state.currentTime}
                />
                <TrackDetails title={track.title} artist={this.state.playingExercise.name} />
                <Text style={styles.text}>
                  { !isNaN(this.state.currentTime) || this.state.currentTime < 0 ? `${parseInt(this.state.currentTime, 10)}s` : '0s' }
                  /
                  { `${parseInt(this.state.totalLength, 10)}s` }
                </Text>
              </View>
            )
          }     
          {video}
        </View>
      </View>
    );
  }
}