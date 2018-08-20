import React, { Component } from 'react';
import {
  AppState, Text, View, ScrollView,
} from 'react-native';
import Video from 'react-native-video';
import firebase from '../config/firebase';
import AlbumArt from '../common/AlbumArt';
import TrackDetails from '../common/TrackDetails';
import Controls from '../common/Controls';
import Seekbar from '../common/Seekbar';
import Loading from '../common/Loading';

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#001331',
  },
  containerInner: {
    marginTop: 30,
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
  albumView: {
    backgroundColor: '#33425a',
    paddingRight: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  line: {
    width: '100%',
    height: 1,
    backgroundColor: 'white',
  },
};

export default class TalonIntelPlayer extends Component {
  static navigationOptions = {
    title: 'Talon Intel Player',
    // header: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      paused: true,
      totalLength: 1,
      currentTime: 0.0,
      selectedTrack: 0,
      playingExercise: '',
      windowsHeight: 0,
      windowsWidth: 0,
    };
  }

  componentDidMount() {
    Object.entries(this.props.navigation.state.params.exercises)
      .map(([key, value], i) => {
        i === 0
          ? this.setState({
            playingExercise: { value }
          })
          : null;
      });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.currentTime > 0) {
      // this.changeExercises;
    }
  }

  onBack = () => {
    const { currentTime } = this.state;
    const SEEK_BEHIND = 10;
    this.setState({ currentTime: currentTime - SEEK_BEHIND });
    this.player.seek(currentTime - SEEK_BEHIND, 10);
  }

  onForward = () => {
    const { currentTime } = this.state;
    const SEEK_FORWARD = 10;
    this.setState({ currentTime: currentTime + SEEK_FORWARD });
    this.player.seek(currentTime + SEEK_FORWARD, 10);
  }

  onPressPause = () => {
    this.setState({ paused: true });
  }

  onExercisePress = () => {
    this.props.navigation.navigate('ExercisePlayer', { exercise: this.state.playingExercise });
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
        // this.setTimeFirebase();
      }
    });
  };

  onLoad = (data) => {
    this.player.seek(this.state.currentTimem, 10);
    this.setState({ totalLength: data.duration, loading: false });
  };

  onDragSeekBar = (currentTime) => {
    this.player.seek(currentTime, 10);
  }

  onPressPlay = () => {
    this.setState({ paused: false });
  }

  setTime(data) {
    this.setState({ currentPosition: Math.floor(data.currentTime) });
  }

  getCurrentTimeInMs = time => parseInt(time, 10);

  formatTime = (timeToFormat) => {
    let minutes = 0;
    const seconds = Math.round(timeToFormat);
    if (seconds > 60) {
      minutes = Math.floor(seconds / 60);
    }
    const time = `${minutes} : ${seconds % 60}`;
    return time;
  }

  detectOrientation = (track) => {
    if (this.state.windowsHeight > this.state.windowsWidth) {
      return this.renderPortraitView(track);
    }
    return this.renderLandscapeView(track);
  };

  renderLandscapeView = (track) => {
    // const { imageUrl, title } = this.state.playingExercise.value;
    return (
      <View style={{ flex: 2, flexDirection: 'row' }}>
        <View style={{ flex: 1, backgroundColor: '#33425a', padding: 20 }}>
          <AlbumArt
            url={
             this.state.playingExercise
               ? this.state.playingExercise.value.imageUrl
               : track.workoutImage
            }
            currentExercise={this.state.playingExercise.name}
            onPress={() => {}}
          />
        </View>
        <View style={{ flex: 1, justifyContent: 'space-between' }}>
          <TrackDetails title={track.title} />
          <Controls
            onPressPlay={this.onPressPlay}
            onPressPause={this.onPressPause}
            onBack={this.onBack}
            onForward={this.onForward}
            onDownload={this.onDownload}
            paused={this.state.paused}
            renderForwardButton
          />
          { this.state.loading
            ? <Loading />
            : (
              <View>
                <Seekbar
                  totalLength={this.state.totalLength}
                  onDragSeekBar={this.onDragSeekBar}
                  seekValue={this.state.currentTime && this.state.currentTime}
                />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10 }}>
                  <Text style={{ color: 'white' }}>
                    {this.formatTime(this.state.currentTime)}
                  </Text>
                  <Text style={{ color: 'white', alignSelf: 'flex-end' }}>
                    {this.formatTime(this.state.totalLength - this.state.currentTime)}
                  </Text>
                </View>
              </View>
            )
          }
        </View>
      </View>
    );
  }

  renderPortraitView = (track) => {
    const { imageUrl, title } = this.state.playingExercise.value;
    return (
      <View>
        <View style={styles.albumView}>
          <AlbumArt
            url={
             this.state.playingExercise
               ? imageUrl
               : track.workoutImage
            }
            currentExercise={title}
            onPress={() => {}}
          />
        </View>
        <View style={styles.line} />
        { this.state.loading
          ? <Loading />
          : (
            <View>
              <Seekbar
                totalLength={this.state.totalLength}
                onDragSeekBar={this.onDragSeekBar}
                seekValue={this.state.currentTime && this.state.currentTime}
              />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10 }}>
                <Text style={{ color: 'white' }}>
                  {this.formatTime(this.state.currentTime)}
                </Text>
                <Text style={{ color: 'white', alignSelf: 'flex-end' }}>
                  {this.formatTime(this.state.totalLength - this.state.currentTime)}
                </Text>
              </View>
              <TrackDetails title={track.title} />
              <Controls
                onPressPlay={this.onPressPlay}
                onPressPause={this.onPressPause}
                onBack={this.onBack}
                onForward={this.onForward}
                onDownload={this.onDownload}
                paused={this.state.paused}
                renderForwardButton
              />
            </View>
          )
        }
      </View>
    );
  }

  render() {
    const track = this.props.navigation.state.params.tracks[this.state.selectedTrack];
    const video = (
      <Video
        source={{ uri: track.audioUrl }} // Can be a URL or a local file.
        ref={(ref) => {
          this.player = ref;
        }}
        progressUpdateInterval={100.0}
        paused={this.state.paused} // Pauses playback entirely.
        resizeMode="cover" // Fill the whole screen at aspect ratio.
        playInBackground // ={true}
        onLoad={this.onLoad}
        onProgress={this.onProgress}
        style={styles.audioElement}
      />
    );

    return (
      <ScrollView
        style={styles.container}
        onLayout={(event) => {
          this.setState({
            windowsWidth: event.nativeEvent.layout.width,
            windowsHeight: event.nativeEvent.layout.height,
          });
        }}
      >
        {this.detectOrientation(track)}
        {video}
      </ScrollView>
    );
  }
}
