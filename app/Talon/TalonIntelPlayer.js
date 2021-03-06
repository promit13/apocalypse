import React, { Component } from 'react';
import {
  AppState, View, Platform, BackHandler,
} from 'react-native';
import { Text, Icon } from 'react-native-elements';
import Video from 'react-native-video';
import MusicControl from 'react-native-music-control';
import { moderateScale } from 'react-native-size-matters';
import RNFetchBlob from 'react-native-fetch-blob';
import Orientation from 'react-native-orientation';
import KeepAwake from 'react-native-keep-awake';
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
    marginTop: moderateScale(30),
  },
  textTitle: {
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    fontSize: moderateScale(24),
  },
  loading: {
    marginTop: moderateScale(30),
  },
  audioElement: {
    height: 0,
    width: 0,
  },
  albumView: {
    height: '55%',
  },
  line: {
    width: '100%',
    height: moderateScale(1),
    backgroundColor: 'white',
  },
  headerView: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#001331',
    height: moderateScale(50),
    width: '100%',
  },
};
const albumImage = 'https://firebasestorage.googleapis.com/v0/b/astraining-95c0a.appspot.com/o/talon%2FTALON%20(1).png?alt=media&token=fffc9c31-acdb-4c07-aa0f-c9b3912d7755';
const appicon = require('../../img/appicon.png');

export default class TalonIntelPlayer extends Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.getParam('mode', ''),
      headerLeft: (
        Platform.OS === 'android'
          ? (
            <Icon
              iconStyle={{ marginLeft: 15 }}
              name="arrow-left"
              type="material-community"
              size={25}
              color="white"
              underlayColor="#001331"
              onPress={() => { navigation.state.params.handleSave(); }}
            />
          )
          : (
            <Icon
              name="chevron-left"
              type="feather"
              size={38}
              color="#fff"
              underlayColor="#001331"
              onPress={() => { navigation.state.params.handleSave(); }}
            />
          )
      ),
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
    playerTitle: '',
    platform: '',
    navigateBack: '',
  };

  componentDidMount() {
    const platform = Platform.OS;
    Orientation.unlockAllOrientations();
    this.props.navigation.setParams({ handleSave: this.navigateBackTo });
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
    const {
      episodeId, talon, exerciseTitle, video, image, offline, advance, exercise, episodeExerciseTitle, uid, mode, navigateBack, autoPlay,
    } = this.props.navigation.state.params;
    console.log(video);
    if (talon) {
      firebase.database().ref(`episodes/${episodeId}`).on('value', (snapshot) => {
        const { title, intel } = snapshot.val();
        this.setState({
          platform,
          playerTitle: mode,
          navigateBack,
          episodeTitle: title,
          videoUrl: intel,
          playingExercise: { value: { image: albumImage, title: '' } },
          loadScreen: false,
        });
        // this.setEpisodeCompletedArray(snap, snapshot);
      });
    } else if (offline) {
      const dirs = RNFetchBlob.fs.dirs.DocumentDir;
      const formattedExerciseName = exerciseTitle.replace(/\s+/g, '');
      RNFetchBlob.fs.exists(`${dirs}/AST/introExercises/${formattedExerciseName}.mp4`)
        .then((exists) => {
          if (advance) {
            this.setState({
              platform,
              playerTitle: mode,
              navigateBack,
              videoUrl: exists ? `file://${dirs}/AST/advanceExercises/${formattedExerciseName}.mp4` : '',
              episodeTitle: episodeExerciseTitle,
              playingExercise: { value: { image: `file://${dirs}/AST/advanceImages/${formattedExerciseName}.png`, title: '' } },
              loadScreen: false,
              exercise,
              loading: exists ? true : false,
            });
          } else {
            this.setState({
              platform,
              playerTitle: mode,
              navigateBack,
              videoUrl: exists ? `file://${dirs}/AST/introExercises/${formattedExerciseName}.mp4` : '',
              episodeTitle: episodeExerciseTitle,
              playingExercise: { value: { image: `file://${dirs}/AST/introImages/${formattedExerciseName}.png`, title: '' } },
              // playingExercise: { value: { image: formattedExerciseName, title: '' } },
              loadScreen: false,
              exercise,
              loading: exists ? true : false,
            });
          }
        });
    } else {
      this.setState({
        platform,
        playerTitle: mode,
        episodeTitle: exerciseTitle,
        navigateBack,
        videoUrl: video,
        playingExercise: { value: { image, title: '' } },
        loadScreen: false,
        exercise,
        loading: video === '' ? false : true,
      });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.currentTime > 0) {
      // this.changeExercises;
    }
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
  }

  onBack = () => {
    const { currentTime } = this.state;
    this.setState({ currentTime: currentTime - 10 });
    this.player.seek(currentTime - 10, 10);
    this.updateMusicControl(currentTime - 10);
  }

  onForward = () => {
    const { currentTime } = this.state;
    this.player.seek(currentTime + 10, 10);
    this.setState({ currentTime: currentTime + 10 });
    this.updateMusicControl(currentTime + 10);
  }

  onPressPause = () => {
    this.setState({ paused: true });
    MusicControl.updatePlayback({
      state: MusicControl.STATE_PAUSED,
      elapsedTime: this.state.currentTime,
    });
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
    const { autoPlay } = this.props.navigation.state.params;
    if (!autoPlay) {
      this.registerEvents(data);
    }
    this.player.seek(this.state.currentTime, 10);
    this.setState({ totalLength: data.duration, loading: false, paused: !autoPlay });
  };

  onEnd = () => {
    this.setState({ paused: true, currentTime: 0 });
    this.updateMusicControl(0);
  }

  onDragSeekBar = (currentTime) => {
    this.setState({ paused: true });
  }

  onPressPlay = () => {
    this.setState({ paused: false });
    MusicControl.updatePlayback({
      state: MusicControl.STATE_PLAYING,
      elapsedTime: this.state.currentTime,
    });
  }

  getCurrentTimeInMs = time => parseInt(time, 10);

  registerEvents = (data) => {
    const {
      exercise, exerciseTitle,
    } = this.props.navigation.state.params;
    const { playingExercise } = this.state;
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
      if (!exercise) {
        this.onForward();
      }
    });
    MusicControl.on('skipBackward', () => {
      if (!exercise) {
        this.onBack();
      }
    });

    MusicControl.enableControl('play', true);
    MusicControl.enableControl('pause', true);
    MusicControl.enableControl('previousTrack', false);
    MusicControl.enableControl('skipForward', !exercise, { interval: 10 }); // iOS only
    MusicControl.enableControl('skipBackward', !exercise, { interval: 10 }); // iOS only
    // MusicControl.enableControl('skipForward', true, { interval: 10 }); // for android
    // MusicControl.enableControl('skipBackward', true, { interval: 10 }); // for android
    MusicControl.enableControl('closeNotification', true, { when: 'paused' });

    MusicControl.setNowPlaying({
      title: exerciseTitle,
      duration: data.duration,
      // artwork: playingExercise.value.image,
      artwork: appicon,
    });
  }

  updateMusicControl = (elapsedTime) => {
    const { autoPlay } = this.props.navigation.state.params;
    if (!autoPlay) {
      MusicControl.updatePlayback({
        elapsedTime,
      });
    }
  }

  navigateBackTo = () => {
    Orientation.lockToPortrait();
    const { navigateBack } = this.state;
    // if (navigateBack !== 'DownloadTestPlayer' && navigateBack !== 'EpisodeSingle') {
    //   Orientation.lockToPortrait();
    // }
    this.props.navigation.navigate(navigateBack);
  }

  handleBackButton = () => {
    this.navigateBackTo();
    return true;
  }

  sliderReleased = (currentTime) => {
    this.setState({ paused: false, currentTime });
    this.player.seek(currentTime, 10);
    this.updateMusicControl(currentTime);
  }

  setEpisodeCompletedArray = (snap, snapshot) => {
    const {
      episodeId, uid,
    } = this.props.navigation.state.params;
    const { title, intel } = snapshot.val();
    const { playedIntelArray } = snap.val();
    let playedArray;
    console.log(playedIntelArray);
    if (playedIntelArray === '') {
      playedArray = [];
    } else {
      playedArray = Object.values(playedIntelArray);
    }
    console.log(playedArray);
    const played = playedArray.some((el) => {
      return el.episodeId === uid;
    });
    console.log(played);
    this.setState({
      episodeTitle: title,
      videoUrl: intel,
      playingExercise: { value: { image: albumImage, title: '' } },
      loadScreen: false,
    });
    if (!played) {
      firebase.database().ref(`userDatas/${uid}/playedIntelArray`).push(
        {
          episodeId,
        },
      );
    }
  }

  detectOrientation = (track) => {
    if (this.state.windowsHeight > this.state.windowsWidth) {
      return this.renderPortraitView(track);
    }
    return this.renderLandscapeView(track);
  };

  renderLandscapeView = () => {
    const {
      playingExercise, episodeTitle, exercise, paused, loading, totalLength, currentTime, videoUrl, platform, playerTitle,
    } = this.state;
    return (
      <View style={{ flex: 1 }}>
        {/* { platform === 'android'
          ? (
            <View style={styles.headerView}>
              <Icon
                iconStyle={{ marginLeft: 15 }}
                name="arrow-left"
                type="material-community"
                size={25}
                color="white"
                onPress={() => this.navigateBackTo()}
              />
              <Text style={[styles.textTitle, { marginLeft: 20, fontSize: 20 }]}>
                {playerTitle}
              </Text>
            </View>
          )
          : (
            <View style={styles.headerView}>
              <Icon
                name="chevron-left"
                type="feather"
                size={38}
                color="white"
                onPress={() => this.navigateBackTo()}
              />
              <View style={{ flex: 1, marginLeft: -10 }}>
                <Text style={[styles.textTitle, { fontSize: 18 }]}>
                  {playerTitle}
                </Text>
              </View>
            </View>
          )
        } */}
        <View style={{ flex: 2, flexDirection: 'row' }}>
          <View style={{ flex: 1, padding: moderateScale(10) }}>
            <AlbumArt
              url={
              playingExercise
                ? playingExercise.value.image
                : null
              }
              talonPlayer
              // onPress={() => {}}
              paddingTop="5%"
            />
          </View>
          <View style={{ flex: 1, justifyContent: videoUrl === '' ? 'center' : 'space-between' }}>
            <Text style={[styles.textTitle, { marginTop: moderateScale(10) }]}>
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
      </View>
    );
  }

  renderPortraitView = () => {
    const {
      playingExercise, loading, totalLength, currentTime, episodeTitle, paused, videoUrl, exercise, platform, playerTitle,
    } = this.state;
    return (
      <View>
        {
          loading ? <LoadScreen />
            : (
              <View style={{ height: '100%' }}>
                <View style={styles.line} />
                <View style={styles.albumView}>
                  <AlbumArt
                    url={
                      playingExercise
                        ? playingExercise.value.image
                        : null
                    }
                    talonPlayer
                    // onPress={() => {}}
                    paddingTop="5%"
                  />
                </View>
                <View style={styles.line} />
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
                  <Text style={[styles.textTitle, { marginTop: moderateScale(10) }]}>
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
              </View>
            )}
      </View>
    );
  }

  render() {
    const { videoUrl, loadScreen, loading, platform } = this.state;
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
          repeat={platform === 'android' ? false : true}
          style={styles.audioElement}
        />
      );
    return (
      <View
        style={[styles.container, { justifyContent: loading ? 'center' : null, alignItems: loading ? 'center' : null }]}
        onLayout={(event) => {
          this.setState({
            windowsWidth: event.nativeEvent.layout.width,
            windowsHeight: event.nativeEvent.layout.height,
          });
        }}
      >
        <KeepAwake />
        {this.detectOrientation()}
        {video}
      </View>
    );
  }
}
