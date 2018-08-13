import React, { Component } from 'react';
import {
  ActivityIndicator, AppState, Text, View,
} from 'react-native';
import Video from 'react-native-video';
import firebase from '../config/firebase';
import AlbumArt from '../common/AlbumArt';
import TrackDetails from '../common/TrackDetails';
import Controls from '../common/Controls';

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

export default class EpisodeSingle extends Component {
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
  }

  componentDidMount() {
    // this.setState({
    const firstExercise = Object.entries(this.props.exercises)
      .map(([exercise, value], i) => {
        i === 0
          ? this.setState({
            playingExercise: { name: exercise, value },
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
      console.log('App has come to the foreground!');
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
      console.log(error);
    });
    this.setState({ loading: false });
  };

  onDownload() {
    console.log(this.props.tracks[0].audioUrl);
    RNFS.downloadFile({ fromUrl: this.props.tracks[0].audioUrl, toFile: 'cache' }).promise.then((res) => {
      console.log('done');
      console.log(res);
    });
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
      'value', (snapshot) => {
        return snapshot.val()
      }, (error) => {
        console.log(error);
      },
    );
  }

  changeExercises() {
    const exercises = Object.entries(this.props.exercises).map(([key, value], i) => {
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
    const track = this.props.tracks[this.state.selectedTrack];
    const video = (
      <Video
        source={{ uri: track.audioUrl }} // Can be a URL or a local file.
        ref={(ref) => {
          this.player = ref;
        }}
        progressUpdateInterval={1000.0}
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
            onPress={this.onExercisePress.bind(this)}
           />
          { this.state.loading ? 
            <ActivityIndicator size="large" color="white" style={styles.loading} /> :
            <View>
             <Controls
                onPressPlay={this.onPressPlay.bind(this)}
                onPressPause={this.onPressPause.bind(this) }
                onBack={this.onBack.bind(this)}
                onDownload={this.onDownload.bind(this)}
                paused={this.state.paused}
              />
              <TrackDetails title={track.title} artist={this.state.playingExercise.name } />
              <Text style={styles.text}>
                { !isNaN(this.state.currentTime) || this.state.currentTime < 0 ? `${parseInt(this.state.currentTime, 10)}s` : '0s' } / 
                { `${parseInt(this.state.totalLength, 10)}s` }
              </Text> 
            </View>
          }
          
          {video}
          
        </View>
      </View>
    );
  }
}


