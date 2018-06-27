import React, { Component } from 'react';
import {
  AppState,
  View,
  Text,
  StatusBar,
} from 'react-native';
import Video from 'react-native-video';
import firebase from './config/firebase';

import Header from './Header';
import AlbumArt from './AlbumArt';
import TrackDetails from './TrackDetails';
import Controls from './Controls';
import Exercise from './Exercise';

export default class Player extends Component {
  
  constructor(props) {
    super(props);
    this.state = {
      paused: true,
      totalLength: 1,
      currentTime: 0.0,
      selectedTrack: 0,
      repeatOn: false,
      shuffleOn: false,
      playingExercise: '',
    };
  }
  componentDidMount() {
    // this.setState({
    const firstExercise = Object.entries(this.props.exercises)
      .map(([exercise, value], i) => {
        i == 0 ? 
          this.setState({
            playingExercise: {name: exercise, value: value}
          })
          : null;
      });
    this.getTimeFirebase() !== 0 ? 
      this.setState({currentTime: this.getTimeFirebase()})
      : null;
    this.getTimeFirebase();
  }
  setTime(data) {
    this.setState({currentPosition: Math.floor(data.currentTime)});
  }

  onBack() {
    firebase.database().ref(`videos/example`).set({
      timeStamp: this.state.currentTime,
    });
  }
  onPressPause() {
    this.setState({paused: true})
    firebase.database().ref(`videos/example`).set({
      timeStamp: this.state.currentTime,
    });
  }
  setTimeFirebase() {
    firebase.database().ref(`videos/example`).set({
      timeStamp: this.state.currentTime,
    });
  }
  getTimeFirebase() {
    firebase.database().ref('videos/example').on(
    'value', (snapshot) => {
        return snapshot.val()
        console.log(snapshot.val());
      }, (error) => {
        console.log(error);
      },
    );
  }
  onExercisePress() {
    this.props.navigation.navigate('Exercise', {exercise: this.state.playingExercise});
    this.setState({paused: true})
    firebase.database().ref(`videos/example`).set({
      timeStamp: this.state.currentTime,
    });
  }
  
  onAppStateChange = (nextAppState) => {
    if (nextAppState === 'background') {
      console.log('App has come to the foreground!')
    }

  }
  onProgress = (data) => {
    this.setState({ currentTime: data.currentTime });
    AppState.addEventListener('change', state => {
        if (state === 'background') {
          this.setTimeFirebase();
        }
      });
    
  };

  onLoad = (data) => {
    const setTime = firebase.database().ref('videos').push();
    this.setState({ totalLength: data.duration });
    
    
  };
  onDownload() {
    console.log(this.props.tracks[0].audioUrl);
    RNFS.downloadFile({fromUrl:this.props.tracks[0].audioUrl, toFile: 'cache'}).promise.then(res => {
      console.log('done');
      console.log(res);
    });
  }

  onPressPlay() {
    
    this.setState({paused: false});

  }
  render() {
    const track = this.props.tracks[this.state.selectedTrack];
    const video =  (
      <Video source={{uri: track.audioUrl}} // Can be a URL or a local file.
        ref={(ref: Video) => { this.video = ref }}
        paused={this.state.paused}               // Pauses playback entirely.
        resizeMode="cover"           // Fill the whole screen at aspect ratio.
        playInBackground={true}
        onLoad={this.onLoad}
        onProgress={this.onProgress}
        progressUpdateInterval={1000.0}
        style={styles.audioElement} />
    );

    return (
      <View style={styles.container}>
        <View style={styles.containerInner} >     
          <AlbumArt 
            url={
              this.props.currentExercise ? 
                this.props.currentExercise.value.imageUrl :
                track.workoutImage
            }
            onPress={this.onExercisePress.bind(this)}
           />
          <Controls
            onPressPlay={this.onPressPlay.bind(this)}
            onPressPause={this.onPressPause.bind(this) }
            onBack={this.onBack.bind(this)}
            onDownload={this.onDownload.bind(this)}
            paused={this.state.paused}
          />
          <TrackDetails title={track.title} artist={this.state.playingExercise.name } />

          {video}
          
        </View>
      </View>
    );
  }
}

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
  },
  audioElement: {
    height: 0,
    width: 0,
  }
};
