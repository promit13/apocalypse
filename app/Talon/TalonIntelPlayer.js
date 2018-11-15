import React, { Component } from 'react';
import {
  AppState, View, ScrollView, AsyncStorage,
} from 'react-native';
import { Text } from 'react-native-elements';
import Video from 'react-native-video';
import MusicControl from 'react-native-music-control';
import RNFetchBlob from 'react-native-fetch-blob';
import Orientation from 'react-native-orientation';
import firebase from '../config/firebase';
import AlbumArt from '../common/AlbumArt';
import Controls from '../common/Controls';
import Seekbar from '../common/Seekbar';
import Loading from '../common/Loading';
import FormatTime from '../common/FormatTime';
import LoadScreen from '../common/LoadScreen';

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#001331',
    height: '100%',
  },
  containerInner: {
    marginTop: 30,
  },
  textTitle: {
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginTop: 10,
  },
  loading: {
    marginTop: 30,
  },
  audioElement: {
    height: 0,
    width: 0,
  },
  albumView: {
    height: '60%',
  },
  line: {
    width: '100%',
    height: 1,
    backgroundColor: 'white',
  },
};
const albumImage = 'https://firebasestorage.googleapis.com/v0/b/astraining-95c0a.appspot.com/o/talon%2FTALON.png?alt=media&token=4c4566fc-ff31-4a89-b674-7e73e52eaa98';

export default class TalonIntelPlayer extends Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.state.params.mode,
      // header: null,
    };
  };

  state = {
    loading: true,
    loadScreen: true,
    paused: true,
    exercise: false,
    totalLength: 1,
    currentTime: 0.0,
    playingExercise: '',
    windowsHeight: 0,
    windowsWidth: 0,
    episodeTitle: '',
    videoUrl: '',
  };

  componentDidMount() {
    Orientation.unlockAllOrientations();
    const {
      episodeId, talon, exerciseTitle, video, image, offline, advance, exercise, episodeExerciseTitle,
    } = this.props.navigation.state.params;
    if (talon) {
      firebase.database().ref(`episodes/${episodeId}`).on('value', async (snapshot) => {
        const { title, intel } = snapshot.val();
        let playedIntelArray = [];
        const playedIntel = await AsyncStorage.getItem('playedIntelArray');
        if (playedIntel !== null) {
          playedIntelArray = JSON.parse(playedIntel);
        }
        if (!playedIntelArray.includes(episodeId)) {
          playedIntelArray.push(episodeId);
        }
        await AsyncStorage.setItem('playedIntelArray', JSON.stringify(playedIntelArray));
        this.setState({
          episodeTitle: title,
          videoUrl: intel,
          playingExercise: { value: { image: albumImage, title: '' } },
          loadScreen: false,
        });
      });
    } else if (offline) {
      const { dirs } = RNFetchBlob.fs;
      const formattedExerciseName = exerciseTitle.replace(/\s+/g, '');
      RNFetchBlob.fs.exists(`${dirs.DocumentDir}/AST/introExercises/${formattedExerciseName}.mp4`)
        .then((exists) => {
          console.log(exists);
          if (advance) {
            this.setState({
              videoUrl: exists ? `${dirs.DocumentDir}/AST/advanceExercises/${formattedExerciseName}.mp4` : '',
              episodeTitle: episodeExerciseTitle,
              playingExercise: { value: { image: `${dirs.DocumentDir}/AST/advanceImages/${formattedExerciseName}.png`, title: '' } },
              loadScreen: false,
              exercise,
              loading: exists ? true : false,
            });
          } else {
            this.setState({
              videoUrl: exists ? `${dirs.DocumentDir}/AST/introExercises/${formattedExerciseName}.mp4` : '',
              episodeTitle: episodeExerciseTitle,
              playingExercise: { value: { image: `${dirs.DocumentDir}/AST/introImages/${formattedExerciseName}.png`, title: '' } },
              loadScreen: false,
              exercise,
              loading: exists ? true : false,
            });
          }
        });
    } else {
      this.setState({
        episodeTitle: exerciseTitle,
        videoUrl: video,
        playingExercise: { value: { image, title: '' } },
        loadScreen: false,
        exercise,
        loading: video === '' ? false : true,
      });
    }
    this.registerEvents();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.currentTime > 0) {
      // this.changeExercises;
    }
  }

  onBack = () => {
    const { currentTime } = this.state;
    this.setState({ currentTime: currentTime - 10 });
    this.player.seek(currentTime - 10, 10);
  }

  onForward = () => {
    const { currentTime } = this.state;
    this.player.seek(currentTime + 10, 10);
    this.setState({ currentTime: currentTime + 10 });
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

  onEnd = () => {
    this.setState({ paused: true });
  }

  onDragSeekBar = (currentTime) => {
    this.setState({ paused: true });
  }

  onPressPlay = () => {
    this.setState({ paused: false });
  }

  getCurrentTimeInMs = time => parseInt(time, 10);

  registerEvents = () => {
    const {
      exercise, exerciseTitle,
    } = this.props.navigation.state.params;
    MusicControl.enableBackgroundMode(true);

    // on iOS, pause playback during audio interruptions (incoming calls) and resume afterwards.
    MusicControl.handleAudioInterruptions(true);

    MusicControl.on('play', () => {
      // this.props.dispatch(this.onPressPlay());
      this.onPressPlay();
    });

    // on iOS this event will also be triggered by audio router change events
    // happening when headphones are unplugged or a bluetooth audio peripheral disconnects from the device
    MusicControl.on('pause', () => {
      this.onPressPause();
    });

    MusicControl.on('skipForward', () => {
      this.onForward();
    });
    MusicControl.on('skipBackward', () => {
      this.onBack();
    });

    MusicControl.setNowPlaying({
      title: exerciseTitle,
    });

    MusicControl.enableControl('play', true);
    MusicControl.enableControl('pause', true);
    MusicControl.enableControl('seek', false);
    MusicControl.enableControl('skipForward', !exercise, { interval: 10 }); // iOS only
    MusicControl.enableControl('skipBackward', !exercise, { interval: 10 }); // iOS only
    MusicControl.enableControl('closeNotification', true, { when: 'never' });
  }

  sliderReleased = (currentTime) => {
    this.setState({ paused: false, currentTime });
    this.player.seek(currentTime, 10);
  }

  detectOrientation = (track) => {
    if (this.state.windowsHeight > this.state.windowsWidth) {
      return this.renderPortraitView(track);
    }
    return this.renderLandscapeView(track);
  };

  renderLandscapeView = () => {
    const {
      playingExercise, episodeTitle, exercise, paused, loading, totalLength, currentTime, videoUrl,
    } = this.state;
    return (
      <View style={{ flex: 2, flexDirection: 'row' }}>
        <View style={{ flex: 1, padding: 10 }}>
          <AlbumArt
            url={
             playingExercise
               ? playingExercise.value.image
               : null
            }
            talonPlayer
            onPress={() => {}}
            paddingTop="15%"
          />
        </View>
        <View style={{ flex: 1, justifyContent: videoUrl === '' ? 'center' : 'space-between' }}>
          <Text h4 style={styles.textTitle}>
            {episodeTitle}
          </Text>
          {
            exercise
              ? (
                videoUrl === ''
                ? null
                : (
                  <Controls
                    onPressPlay={this.onPressPlay}
                    onPressPause={this.onPressPause}
                    paused={paused}
                    exercisePlayer
                  />
                )
              )
              : (
                <Controls
                  onPressPlay={this.onPressPlay}
                  onPressPause={this.onPressPause}
                  onBack={this.onBack}
                  onForward={this.onForward}
                  onDownload={this.onDownload}
                  paused={paused}
                  renderForwardButton
                />
              )
          }
          { loading
            ? <Loading />
            : (
              videoUrl === ''
              ? null
              : (
                <View>
                  <Seekbar
                    totalLength={totalLength}
                    onDragSeekBar={this.onDragSeekBar}
                    seekValue={currentTime && currentTime}
                  />
                  <FormatTime
                    currentTime={currentTime}
                    remainingTime={totalLength - currentTime}
                  />
                </View> 
              )
            )
          }
        </View>
      </View>
    );
  }

  renderPortraitView = () => {
    const {
      playingExercise, loading, totalLength, currentTime, episodeTitle, paused, videoUrl, exercise,
    } = this.state;
    return (
      <View>
        <View style={styles.line} />
        <View style={styles.albumView}>
          <AlbumArt
            url={
              playingExercise
                ? playingExercise.value.image
                : null
            }
            talonPlayer
            onPress={() => {}}
            paddingTop="15%"
          />
        </View>
        <View style={styles.line} />
        { loading
          ? <Loading />
          : (
            <View>
              {
                videoUrl === ''
                  ? null
                  : (
                    <View>
                      <Seekbar
                        totalLength={totalLength}
                        onDragSeekBar={this.onDragSeekBar}
                        sliderReleased={this.sliderReleased}
                        seekValue={currentTime && currentTime}
                      />
                      <FormatTime
                        currentTime={currentTime}
                        remainingTime={totalLength - currentTime}
                      />
                    </View>
                  )
              }
              <Text h4 style={styles.textTitle}>
                {episodeTitle}
              </Text>
              {
            exercise
              ? (
                videoUrl === ''
                ? null
                : (
                    <Controls
                      onPressPlay={this.onPressPlay}
                      onPressPause={this.onPressPause}
                      paused={paused}
                      exercisePlayer
                    />
                  )
              )
              : (
                <Controls
                  onPressPlay={this.onPressPlay}
                  onPressPause={this.onPressPause}
                  onBack={this.onBack}
                  onForward={this.onForward}
                  onDownload={this.onDownload}
                  paused={paused}
                  renderForwardButton
                />
              )
          }
            </View>
          )
        }
      </View>
    );
  }

  render() {
    const { videoUrl, loadScreen } = this.state;
    console.log(videoUrl);
    if (loadScreen) return <LoadScreen />;
    const video = videoUrl === ''
      ? null
      : (
        <Video
          source={{ uri: videoUrl }} // Can be a URL or a local file.
          ref={(ref) => {
            this.player = ref;
          }}
          progressUpdateInterval={100.0}
          paused={this.state.paused} // Pauses playback entirely.
          resizeMode="cover" // Fill the whole screen at aspect ratio.
          playInBackground // ={true}
          ignoreSilentSwitch="ignore"
          onLoad={this.onLoad}
          onProgress={this.onProgress}
          onEnd={this.onEnd}
          repeat
          style={styles.audioElement}
        />
      );
    return (
      <View
        style={styles.container}
        onLayout={(event) => {
          this.setState({
            windowsWidth: event.nativeEvent.layout.width,
            windowsHeight: event.nativeEvent.layout.height,
          });
        }}
      >
        {this.detectOrientation()}
        {video}
      </View>
    );
  }
}
