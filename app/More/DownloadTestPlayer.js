import React, { Component } from 'react';
import {
  AppState, View, Platform, AsyncStorage, BackHandler,
} from 'react-native';
import { Text, Icon } from 'react-native-elements';
import MusicControl from 'react-native-music-control';
import Video from 'react-native-video';
import RNFetchBlob from 'react-native-fetch-blob';
import Pedometer from 'react-native-pedometer';
import GoogleFit from 'react-native-google-fit';
import Orientation from 'react-native-orientation';
import AlbumArt from '../common/AlbumArt';
import Controls from '../common/Controls';
import Seekbar from '../common/Seekbar';
import Loading from '../common/Loading';
import ShowModal from '../common/ShowModal';
import LoadScreen from '../common/LoadScreen';
import FormatTime from '../common/FormatTime';
import realm from '../config/Database';

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
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  loading: {
    marginTop: 30,
  },
  audioElement: {
    height: 0,
    width: 0,
  },
  albumView: {
    paddingTop: 10,
    height: '50%',
  },
  line: {
    width: '100%',
    height: 1,
    backgroundColor: 'white',
  },
  modal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  modalInnerView: {
    backgroundColor: '#fff',
    padding: 10,
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#001331',
    borderRadius: 5,
    marginTop: 10,
  },
  headerView: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#001331',
    height: 50,
    width: '100%',
  },
};
const talonImage = require('../../img/talon.png');
const appicon = require('../../img/appicon.png');
// const albumImage = 'https://firebasestorage.googleapis.com/v0/b/astraining-95c0a.appspot.com/o/talon%2FTALON.png?alt=media&token=4c4566fc-ff31-4a89-b674-7e73e52eaa98';

export default class DownloadTestPlayer extends Component {
  static navigationOptions = ({ navigation }) => {
    return {
      // title: navigation.getParam('mode', ''),
      header: null,
    };
  };

  state = {
    loading: true,
    loadScreen: true,
    paused: true,
    episodeIndex: '',
    seriesIndex: '',
    totalLength: 1,
    currentTime: 0.0,
    playingExercise: '',
    listen: false,
    windowsHeight: 0,
    windowsWidth: 0,
    showDialog: false,
    episodeId: '',
    episodeTitle: '',
    uid: '',
    logId: '',
    loggedWorkOut: '',
    lastLoggedDate: 0,
    previousStartTime: [],
    episodeCompletedArray: [],
    playDate: 0,
    startDate: 0,
    video: '',
    category: '',
    advance: false,
    distance: 0.0,
    steps: 0,
    mode: '',
    platform: '',
    showInfo: false,
    episodeCompleted: false,
    workOutCompleted: false,
    formattedWorkOutStartTime: 0,
    formattedWorkOutEndTime: 0,
    formattedTotalWorkOutTime: 0,
    trackingStarted: false,
    workOutTime: 0,
    showWelcomeDialog: false,
    showIntroAdvanceDialog: false,
  };

  // componentWillMount() {
  //   this.setState({ playingExercise: { value: { image: '', title: '' } } });
  // }

  componentDidMount = async () => {
    Orientation.unlockAllOrientations();
    console.log('OFFLINE');
    const platform = Platform.OS;
    const { dirs } = RNFetchBlob.fs;
    const {
      check, episodeId, episodeIndex, seriesIndex, title, mode, category, advance, uid, exercises,
    } = this.props.navigation.state.params;
    const { cmsTitle } = (exercises[0])[0];
    const formattedFileName = title.replace(/ /g, '_');
    console.log(`${dirs.DocumentDir}/AST/episodes/`);
    this.setState({
      listen: check,
      video: `${dirs.DocumentDir}/AST/episodes/${formattedFileName}.mp4`,
      episodeId,
      category,
      advance,
      episodeIndex,
      seriesIndex,
      platform,
      mode,
      episodeTitle: title,
      uid,
      playingExercise: { value: { image: cmsTitle, title: '' } },
    });
    if (platform === 'android') {
      GoogleFit.authorize((error, result) => {
        if (error) {
          console.log(`AUTH ERROR ${error}`);
        }
        console.log(`AUTH SUCCESS ${result}`);
      });
    }
    if (category === 'Speed') {
      this.setState({ showWelcomeDialog: true });
    } else {
      this.setState({ showIntroAdvanceDialog: true });
    }
   
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
    this.getTimeFirebase();
    if (!check) {
      this.formatWorkOutTime();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.currentTime > 0) {
      // this.changeExercises;
    }
  }

  componentWillUnmount() {
    GoogleFit.unsubscribeListeners();
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
    this.setState({ currentTime: currentTime + 10 });
    this.player.seek(currentTime + 10, 10);
    this.updateMusicControl(currentTime + 10);
  }

  onSeek = () => {
    const { currentTime } = this.state;
    this.player.seek(currentTime);
  }

  onPressPause = () => {
    this.setState({ paused: true });
  }

  onExercisePress = () => {
    const { title, image } = this.state.playingExercise.value;
    this.props.navigation.navigate('TalonIntelPlayer', {
      offline: true,
      exerciseTitle: image,
      episodeExerciseTitle: title,
      image,
      advance: this.state.advance,
      exercise: true,
      mode: 'Exercise Player',
      navigateBack: 'DownloadTestPlayer',
    });
    this.setState({ paused: true });
  }

  onAppStateChange = (nextAppState) => {
    if (nextAppState === 'background') {
    }
  }

  onProgress = (data) => {
    const {
      paused, listen, playDate, currentTime, formattedWorkOutStartTime, trackingStarted, formattedWorkOutEndTime, episodeCompleted,
    } = this.state;
    if (!paused) { // onProgress gets called when component starts in IOS
      if (trackingStarted) {
        if ((data.currentTime - formattedWorkOutEndTime) >= 0) {
          this.setState({ currentTime: data.currentTime, workOutCompleted: true });
        } else if ((data.currentTime - formattedWorkOutStartTime) <= 0) {
          this.setState({ currentTime: data.currentTime, workOutTime: 0 });
        } else {
          this.setState({ currentTime: data.currentTime, workOutTime: (data.currentTime - formattedWorkOutStartTime) });
        }
      } else this.setState({ currentTime: data.currentTime });
      this.changeExercises();
      if (!listen) {
        const currentDate = this.getDate();
        if (((currentDate - playDate) > 60000) && (currentTime > formattedWorkOutStartTime)) {
          this.getStepCountAndDistance();
          this.setState({ playDate: currentDate });
        }
      }
    }
    AppState.addEventListener('change', (state) => {
      if (state === 'background') {
        // this.getD();
      }
    });
  };

  onLoad = (data) => {
    const {
      logId, loggedWorkOut, listen,
    } = this.state;
    this.registerEvents(data);
    // this.setState({ totalLength: data.duration });
    const currentDate = this.getDate();
    if (listen) {
      const { currentTime, lastLoggedDate } = loggedWorkOut;
      if ((currentDate - lastLoggedDate) > 900000) {
        return this.setState({
          currentTime: this.getCurrentTimeInMs(0.0),
          lastLoggedDate,
          totalLength: data.duration,
          loading: false,
        });
      }
      this.setState({
        currentTime: this.getCurrentTimeInMs(currentTime),
        lastLoggedDate,
        totalLength: data.duration,
        loading: false,
      },
      () => {
        this.player.seek(this.state.currentTime, 10);
      });
    } else {
      const {
        workoutDate, timeStamp, workOutTime, trackingStarted,
      } = Array.from(loggedWorkOut)[logId];
      if ((currentDate - workoutDate) > 900000) {
        return this.setState({
          currentTime: this.getCurrentTimeInMs(0.0),
          lastLoggedDate: workoutDate,
          startDate: 0,
          playDate: currentDate,
          totalLength: data.duration,
          loading: false,
        });
      }
      this.setLastPlayedEpisode();
      this.setState({
        currentTime: this.getCurrentTimeInMs(timeStamp),
        lastLoggedDate: workoutDate,
        startDate: workoutDate,
        playDate: currentDate,
        workOutTime,
        trackingStarted,
        totalLength: data.duration,
        loading: false,
      },
      () => {
        this.player.seek(this.state.currentTime, 10);
      });
    }
  };

  onEnd = () => {
    // this.player.seek(0, 0);
    this.updateMusicControl(0);
    this.setState({
      paused: true,
      currentTime: 0.0,
      episodeCompleted: true,
    });
    if (!this.state.listen) {
      this.navigateToEpisodeView(true);
    }
  }

  onDragSeekBar = (currentTime) => {
    this.setState({ paused: true });
  }

  onPressPlay = () => {
    this.setState({ paused: false });
    const { startDate, trackingStarted, currentTime } = this.state;
    this.updateMusicControl(currentTime);
    if (!this.state.listen) {
      const currentDate = this.getDate();
      if ((currentDate - startDate) < 900000) {
        this.setState({ startDate });
      }
    }
  }

  getCurrentTimeInMs = time => parseFloat(time, 10);

  setTimeFirebase = async () => {
    const {
      uid, episodeId, episodeTitle, distance, currentTime, lastLoggedDate, logId, steps, episodeIndex, seriesIndex, listen, workOutCompleted, trackingStarted, workOutTime, category, episodeCompleted,
    } = this.state;
    const currentDate = this.getDate();
    if (listen) {
      await AsyncStorage.setItem(episodeTitle, JSON.stringify({
        currentTime,
        lastLoggedDate: currentDate,
      }));
      return;
    }
    const startDate = await AsyncStorage.getItem(episodeId);
    const timeInterval = !trackingStarted
      ? 0
      : ((currentDate - new Date(startDate).getTime()) / 60000).toFixed(2);
    const workOutCompletedTime = !trackingStarted ? 0 : workOutTime;
    const workOut = Array.from(realm.objects('SavedWorkOut').filtered(`episodeId="${episodeId}"`));
    const { workOutLogs } = workOut[0];
    const workOutLogsArray = Array.from(workOutLogs);
    if ((currentDate - lastLoggedDate) < 900000 && workOutLogsArray.length !== 1) {
      workOutLogsArray.pop();
    }
    workOutLogsArray.push({
      logId,
      episodeTitle,
      category,
      episodeIndex,
      seriesIndex,
      workOutTime: workOutCompletedTime,
      trackingStarted,
      workOutCompleted,
      workoutDate: currentDate,
      episodeCompleted,
      distance,
      timeInterval,
      timeStamp: currentTime,
      steps,
    });
    realm.write(() => {
      realm.create('SavedWorkOut', {
        uid, episodeId, workOutLogs: workOutLogsArray,
      }, true);
    });
  }

  getDate = () => {
    const currentDate = new Date().getTime();
    return currentDate;
  }

  getLastLogId = (snapshot) => {
    const array = Array.from(snapshot);
    this.setState({ logId: array.length - 1, loggedWorkOut: snapshot, loadScreen: false });
  }

  getTimeFirebase = async () => {
    const {
      episodeId, episodeIndex, seriesIndex, title, category, uid, check,
    } = this.props.navigation.state.params;
    if (check) {
      try {
        const listenModeData = await AsyncStorage.getItem(title);
        if (listenModeData !== null) {
          const toLogData = JSON.parse(listenModeData);
          this.setState({ loggedWorkOut: toLogData, loadScreen: false });
        } else {
          this.setState({
            loggedWorkOut: {
              currentTime: 0.0,
              lastLoggedDate: 0,
            },
            loadScreen: false,
          });
        }
      } catch (err) {
        console.log(err);
      }
      return;
    }
    const workOut = Array.from(realm.objects('SavedWorkOut').filtered(`episodeId="${episodeId}"`));
    console.log(workOut);
    if (workOut.length === 0) {
      realm.write(() => {
        const createWorkOut = realm.create('SavedWorkOut', {
          uid, episodeId, workOutLogs: [],
        });
        createWorkOut.workOutLogs.push({
          logId: 0,
          episodeTitle: title,
          category,
          episodeIndex,
          seriesIndex,
          workOutTime: 0,
          trackingStarted: false,
          workOutCompleted: false,
          episodeCompleted: false,
          workoutDate: 0,
          distance: 0,
          timeInterval: '0',
          timeStamp: 0,
          steps: 0,
        });
      });
    }
    const logs = Array.from(realm.objects('SavedWorkOut').filtered(`episodeId="${episodeId}"`));
    const { workOutLogs } = logs[0];
    this.getLastLogId(workOutLogs);
  }

  getStepCountAndDistance = async () => {
    console.log('GET STEP COUNT AND DISTANCE');
    const { episodeId } = this.state;
    const startDate = await AsyncStorage.getItem(episodeId);
    if (this.state.platform === 'android') {
      const endDate = new Date().toISOString();
      const options = {
        startDate,
        endDate, // required ISO8601Timestamp
      };
      GoogleFit.getDailyStepCountSamples(options, (err, res) => {
        if (err) {
          return console.log(err);
        }
        const stepsResponse = res[0];
        const stepArray = stepsResponse.steps;
        if (stepArray.length === 0) {
          return;
        }
        const steps = stepArray[0].value;
        GoogleFit.getDailyDistanceSamples(options, (error, response) => {
          if (error) {
            return console.log(error);
          }
          const distance = ((response[0].distance) / 1000).toFixed(2);
          this.setState({ distance, steps });
          // this.storeDistance((new Date(endDate)).getTime() - (new Date(startDate)).getTime());
        });
      });
    } else {
      const endDate = new Date().getTime();
      const formattedDate = new Date(startDate).getTime();
      Pedometer.queryPedometerDataBetweenDates(
        formattedDate, endDate, (error, pedometerData) => {
          if (error) {
            return console.log(error);
          }
          const { distance, numberOfSteps } = pedometerData;
          this.setState({ steps: numberOfSteps, distance: (distance / 1000).toFixed(2) });
          // this.storeDistance(endDate - formattedDate);
        },
      );
    }
  };

  setCurrentExercise = (snapshot, uid, episodeExerciseTitle) => {
    const { image, title, advanced, video } = snapshot;
    if (video === '') {
      this.setState({
        showInfo: false,
        playingExercise: {
          value: { image, title: episodeExerciseTitle, exerciseId: uid, video },
        },
      });
    } else {
      if (this.state.advance && advanced !== undefined) {
        this.setState({
          showInfo: true,
          playingExercise: {
            value: { image: advanced.image, title: episodeExerciseTitle, exerciseId: uid, video: advanced.video },
          },
        });
        return;
      }
      this.setState({
        showInfo: true,
        playingExercise: {
          value: { image, title: episodeExerciseTitle, exerciseId: uid, video },
        },
      });
    }
  }

  registerEvents = (data) => {
    const {
      check, title,
    } = this.props.navigation.state.params;
    MusicControl.enableBackgroundMode(true);

    // on iOS, pause playback during audio interruptions (incoming calls) and resume afterwards.
    MusicControl.handleAudioInterruptions(true);

    MusicControl.on('previousTrack', () => {
      this.navigateToPreviousExercise();
    });

    MusicControl.on('skipBackward', () => {
      this.onBack();
    });

    MusicControl.on('play', () => {
      // this.props.dispatch(this.onPressPlay());
      this.onPressPlay();
    });

    MusicControl.on('pause', () => {
      this.onPressPause();
    });

    MusicControl.on('skipForward', () => {
      if (check) {
        this.onForward();
      }
    });

    MusicControl.enableControl('skipBackward', check, { interval: 10 }); // iOS only
    MusicControl.enableControl('previousTrack', !check);
    MusicControl.enableControl('play', true);
    MusicControl.enableControl('pause', true);
    MusicControl.enableControl('skipForward', check, { interval: 10 }); // iOS only
    // MusicControl.enableControl('skipForward', true, { interval: 10 }); // for android only
    MusicControl.enableControl('closeNotification', true, { when: 'paused' });

    MusicControl.setNowPlaying({
      title,
      duration: data.duration,
      artwork: appicon,
    });
  }

  updateMusicControl = (elapsedTime) => {
    MusicControl.updatePlayback({
      elapsedTime,
    });
  }

  sliderReleased = (currentTime) => {
    this.setState({ paused: false, currentTime });
    this.player.seek(currentTime);
    this.updateMusicControl(currentTime);
  }

  formatWorkOutTime = () => {
    const { startWT, workoutTime, endWT } = this.props.navigation.state.params;
    console.log(startWT, workoutTime, endWT);
    const startWorkOutTimeArray = startWT.split(':');
    const formattedWorkOutStartTime = (parseInt(startWorkOutTimeArray[0], 10) * 3600) + (parseInt(startWorkOutTimeArray[1], 10) * 60) + (parseInt(startWorkOutTimeArray[2], 10));
    const totalWorkOutTimeArray = workoutTime.split(':');
    const formattedTotalWorkOutTime = (parseInt(totalWorkOutTimeArray[0], 10) * 3600) + (parseInt(totalWorkOutTimeArray[1], 10) * 60) + (parseInt(totalWorkOutTimeArray[2], 10));
    const endWorkOutTimeArray = endWT.split(':');
    const formattedWorkOutEndTime = (parseInt(endWorkOutTimeArray[0], 10) * 3600) + (parseInt(endWorkOutTimeArray[1], 10) * 60) + (parseInt(endWorkOutTimeArray[2], 10));
    this.setState({ formattedWorkOutStartTime, formattedTotalWorkOutTime, formattedWorkOutEndTime });
  }

  navigateToEpisodeView = async (onEnd) => {
    const { listen, episodeCompleted, trackingStarted } = this.state;
    Orientation.lockToPortrait();
    try {
      if (listen) {
        this.setTimeFirebase();
        if (onEnd) {
          return console.log('EPISODE COMPLETED');
        }
      } else {
        if (!episodeCompleted && trackingStarted) {
          this.setTimeFirebase();
        }
        if (onEnd) {
          this.setLastPlayedEpisode();
        }
      }
      this.props.navigation.navigate('EpisodeView');
    } catch (error) {
      console.log(error);
    }
  }

  navigateToPreviousExercise = () => {
    const { previousStartTime } = this.state;
    const startTime = previousStartTime[previousStartTime.length - 2];
    this.setState({ currentTime: startTime === undefined ? 0 : startTime }, () => {
      const { currentTime } = this.state;
      this.player.seek(currentTime, 10);
      this.updateMusicControl(currentTime);
      this.state.previousStartTime.pop(); // removes last item of array
    });
  }

  startTrackingSteps = async () => {
    console.log('START TRACKING');
    const { episodeId } = this.state;
    const startDate = new Date();
    try {
      if (this.state.platform === 'android') {
        await AsyncStorage.setItem(episodeId, startDate.toISOString()); // unique for different episodes
        GoogleFit.startRecording((event) => {});
      } else {
        await AsyncStorage.setItem(episodeId, startDate); // unique for different episodes
        Pedometer.startPedometerUpdatesFromDate(startDate, (pedometerData) => {
          console.log('PEDOMETER STARTED');
        });
      }
    } catch (error) {
      console.log('ERROR S T', error);
    }
  }

  detectOrientation = () => {
    if (this.state.windowsHeight > this.state.windowsWidth) {
      return this.renderPortraitView();
    }
    return this.renderLandscapeView();
  };

  changeExercises = () => {
    const { exercises, exerciseLengthList } = this.props.navigation.state.params;
    if (exercises.length === 0) {
      return;
    }
    const {
      formattedWorkOutStartTime, currentTime, listen, trackingStarted,
    } = this.state;
    if (!listen && (currentTime > formattedWorkOutStartTime) && !trackingStarted) {
      this.setLastPlayedEpisode();
      this.startTrackingSteps();
      this.setState({ trackingStarted: true });
    }
    exerciseLengthList.map((value, i) => {
      if (this.state.currentTime > (value / 1000)) {
        const exercise = exercises[i];
        const {
          cmsTitle, visible, title, episodeExerciseTitle,
        } = exercise[0];
        const showInfo = visible;
        this.setState({
          showInfo,
          playingExercise: {
            value: { image: cmsTitle, title, episodeExerciseTitle },
          },
        });
        this.state.previousStartTime.push(value / 1000);
      }
    });
  }

  handleBackButton = () => {
    this.navigateToEpisodeView();
    return true;
  }

  setLastPlayedEpisode = () => {
    const { uid, episodeId, episodeTitle, episodeIndex, seriesIndex, episodeCompleted } = this.state;
    AsyncStorage.setItem('lastPlayedEpisode', JSON.stringify({
      userId: uid,
      epId: episodeId,
      epTitle: episodeTitle,
      epIndex: episodeIndex,
      serIndex: seriesIndex,
      epCompleted: episodeCompleted,
    }));
  }

  renderLandscapeView = () => {
    const {
      platform, playingExercise, listen, mode, showInfo, loading, totalLength, currentTime, showDialog, episodeTitle, paused, trackingStarted, workOutTime, formattedTotalWorkOutTime, advance,
      showWelcomeDialog, showIntroAdvanceDialog,
    } = this.state;
    const { image, episodeExerciseTitle } = playingExercise.value;
    return (
      <View style={{ flex: 1 }}>
        { platform === 'android'
          ? (
            <View style={styles.headerView}>
              <Icon
                iconStyle={{ marginLeft: 15 }}
                name="arrow-left"
                type="material-community"
                size={25}
                color="white"
                onPress={() => this.navigateToEpisodeView()}
              />
              <Text style={[styles.textTitle, { marginLeft: 20, fontSize: 20 }]}>
                {mode}
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
                onPress={() => this.navigateToEpisodeView()}
              />
              <View style={{ flex: 1, marginLeft: -10 }}>
                <Text style={[styles.textTitle, { fontSize: 18 }]}>
                  {mode}
                </Text>
              </View>
            </View>
          )
        }
        <View style={styles.line} />
        <View style={{ flex: 1, flexDirection: 'row', height: '100%' }}>
          <View style={{
            flex: 0.5, padding: 5, height: '100%',
          }}
          >
            <AlbumArt
              url={
              playingExercise
                ? image
                : null
              }
              currentExercise={episodeExerciseTitle}
              onPress={this.onExercisePress}
              showInfo={showInfo}
              offline
              advance={advance}
            />
          </View>
          <View style={{ marginTop: 30, flex: 0.5, justifyContent: 'space-between' }}>
            <Text h4 style={styles.textTitle}>
              {episodeTitle}
            </Text>
            <View>
              {
                  trackingStarted
                    ? (<FormatTime
                      currentTime={workOutTime}
                      remainingTime={formattedTotalWorkOutTime - workOutTime}
                      workOutTime
                      landscape
                    />
                    )
                    : null
                }
              <Controls
                onPressPlay={this.onPressPlay}
                onPressPause={this.onPressPause}
                onBack={this.onBack}
                onForward={this.onForward}
                onDownload={this.onDownload}
                paused={paused}
                navigateToPreviousExercise={this.navigateToPreviousExercise}
                renderForwardButton={listen}
              />
            </View>
            { loading
              ? <Loading />
              : (
                <View>
                  <Seekbar
                    totalLength={this.state.totalLength}
                    onDragSeekBar={this.onDragSeekBar}
                    sliderReleased={this.sliderReleased}
                    seekValue={currentTime && currentTime}
                    listen={!listen}
                  />
                  <ShowModal
                    visible={showIntroAdvanceDialog}
                    title="Choose Exercise Difficulty Level"
                    description="Would you like to see the easier or harder versions of the exercises and stretches?"
                    buttonText="Whoa, I'm with Flynn..."
                    secondButtonText="Hell yes, I'm with Bay!"
                    askAdvance
                    onPress={() => this.setState({ showIntroAdvanceDialog: false, advance: false })}
                    onSecondButtonPress={() => this.setState({ showIntroAdvanceDialog: false, advance: true })}
                  />
                  <View>
                    { !listen
                      ? (
                        <View>
                          <ShowModal
                            visible={showDialog}
                            title={`Well done! Workout complete,\nAgent Whisky Gambit`}
                            description="Go to TALON to hear your essential intel and track your progress"
                            buttonText="OK"
                            onPress={() => {
                              this.setState({ showDialog: false });
                              this.props.navigation.navigate('TalonScreen');
                            }}
                          />
                          <ShowModal
                            visible={showWelcomeDialog}
                            title="Stay safe while running"
                            description="Keep your volume at a level that allows you to hear other sounds and remain aware of real world hazards"
                            buttonText="Got it"
                            onPress={() => this.setState({ showWelcomeDialog: false })}
                          />
                        </View>
                      )
                      : null
                }
                  </View>
                  <FormatTime
                    currentTime={currentTime}
                    remainingTime={totalLength - currentTime}
                  />
                </View>
              )
            }
          </View>
        </View>
      </View>
    );
  }

  renderPortraitView = () => {
    const {
      platform, playingExercise, listen, mode, showInfo, loading, totalLength, currentTime, showDialog, episodeTitle, paused, trackingStarted, formattedTotalWorkOutTime, workOutTime, advance,
      category, showWelcomeDialog, showIntroAdvanceDialog,
    } = this.state;
    const { image, episodeExerciseTitle } = playingExercise.value;
    return (
      <View style={{ height: '100%' }}>
        { platform === 'android'
          ? (
            <View style={styles.headerView}>
              <Icon
                iconStyle={{ marginLeft: 15 }}
                name="arrow-left"
                type="material-community"
                size={25}
                color="white"
                underlayColor="#001331"
                onPress={() => this.navigateToEpisodeView()}
              />
              <Text style={[styles.textTitle, { marginLeft: 20, fontSize: 20 }]}>
                {mode}
              </Text>
            </View>
          )
          : (
            <View style={[styles.headerView, { marginTop: 15 }]}>
              <Icon
                name="chevron-left"
                type="feather"
                size={38}
                color="white"
                underlayColor="#001331"
                onPress={() => this.navigateToEpisodeView()}
              />
              <View style={{ flex: 1, marginLeft: -10 }}>
                <Text style={[styles.textTitle, { fontSize: 18 }]}>
                  {mode}
                </Text>
              </View>
            </View>
          )
          }
        <View style={styles.albumView}>
          <View style={styles.line} />
          <AlbumArt
            url={
             playingExercise
               ? image
               : null
            }
            currentExercise={episodeExerciseTitle}
            onPress={this.onExercisePress}
            showInfo={showInfo}
            offline
            advance={advance}
            paddingTop={20}
          />
          <View style={styles.line} />
        </View>
        { loading
          ? <Loading />
          : (
            <View>
              <Seekbar
                totalLength={totalLength}
                onDragSeekBar={this.onDragSeekBar}
                sliderReleased={this.sliderReleased}
                seekValue={currentTime && currentTime}
                listen={!listen}
              />
              <View>
                <ShowModal
                  visible={showIntroAdvanceDialog}
                  title="Choose Exercise Difficulty Level"
                  description="Would you like to see the easier or harder versions of the exercises and stretches?"
                  buttonText="Whoa, I'm with Flynn..."
                  secondButtonText="Hell yes, I'm with Bay!"
                  askAdvance
                  onPress={() => this.setState({ showIntroAdvanceDialog: false, advance: true })}
                  onSecondButtonPress={() => this.setState({ showIntroAdvanceDialog: false, advance: false })}
                />
                { !listen
                  ? (
                    <View>
                      <ShowModal
                        visible={showDialog}
                        title={`Well done! Workout complete,\nAgent Whisky Gambit`}
                        description="Go to TALON to hear your essential intel and track your progress"
                        buttonText="OK"
                        onPress={() => {
                          this.setState({ showDialog: false });
                          this.props.navigation.navigate('TalonScreen');
                        }}
                      />
                      <ShowModal
                        visible={showWelcomeDialog}
                        title="Stay safe while running"
                        description="Keep your volume at a level that allows you to hear other sounds and remain aware of real world hazards"
                        buttonText="Got it"
                        onPress={() => this.setState({ showWelcomeDialog: false })}
                      />
                    </View>
                  )
                  : null
              }
              </View>
              <FormatTime
                currentTime={currentTime}
                remainingTime={totalLength - currentTime}
              />
              <Text h4 style={styles.textTitle}>
                {episodeTitle}
              </Text>
              {
                trackingStarted
                  ? (<FormatTime
                    currentTime={workOutTime}
                    remainingTime={formattedTotalWorkOutTime - workOutTime}
                    workOutTime
                  />
                  )
                  : null
              }
              <Controls
                onPressPlay={this.onPressPlay}
                onPressPause={this.onPressPause}
                onBack={this.onBack}
                onForward={this.onForward}
                onDownload={this.onDownload}
                paused={paused}
                navigateToPreviousExercise={this.navigateToPreviousExercise}
                renderForwardButton={listen}
              />
            </View>
          )
        }
      </View>
    );
  }

  render() {
    const { video, loadScreen, paused } = this.state;
    if (loadScreen) return <LoadScreen />;
    const videoPlayer = (
      <Video
        source={{ uri: video }} // 'https://firebasestorage.googleapis.com/v0/b/astraining-95c0a.appspot.com/o/temp%2Fcrowd-cheering.mp3?alt=media&token=def168b4-c566-4555-ab22-a614106298a5'
        ref={(ref) => {
          this.player = ref;
        }}
        progressUpdateInterval={50.0}
        paused={paused} // Pauses playback entirely.
        resizeMode="cover" // Fill the whole screen at aspect ratio.
        playInBackground
        ignoreSilentSwitch="ignore"
        repeat
        playWhenInactive
        onLoad={this.onLoad}
        onEnd={this.onEnd}
        onProgress={this.onProgress}
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
        {videoPlayer}
      </View>
    );
  }
}
