import React, { Component } from 'react';
import {
  AppState, View, ScrollView, Modal, Platform, AsyncStorage, BackHandler, Alert,
} from 'react-native';
import { Text, Button, Icon } from 'react-native-elements';
import axios from 'axios';
import { moderateScale } from 'react-native-size-matters';
import MusicControl from 'react-native-music-control';
import RNFetchBlob from 'react-native-fetch-blob';
import Video from 'react-native-video';
import Pedometer from 'react-native-pedometer';
import GoogleFit from 'react-native-google-fit';
import KeepAwake from 'react-native-keep-awake';
import Orientation from 'react-native-orientation';
import firebase from '../config/firebase';
import AlbumArt from '../common/AlbumArt';
import Controls from '../common/Controls';
import Seekbar from '../common/Seekbar';
import Loading from '../common/Loading';
import ShowModal from '../common/ShowModal';
import LoadScreen from '../common/LoadScreen';
import FormatTime from '../common/FormatTime';

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
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
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
    height: '50%',
  },
  line: {
    width: '100%',
    height: moderateScale(1),
    backgroundColor: 'white',
  },
  modal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: moderateScale(10),
  },
  modalInnerView: {
    backgroundColor: '#fff',
    padding: moderateScale(10),
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#001331',
    borderRadius: moderateScale(5),
    marginTop: moderateScale(10),
  },
  headerView: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#001331',
    height: moderateScale(50),
    width: '100%',
  },
};
const albumImage = 'https://firebasestorage.googleapis.com/v0/b/astraining-95c0a.appspot.com/o/talon%2FTALON.png?alt=media&token=4c4566fc-ff31-4a89-b674-7e73e52eaa98';
const appicon = require('../../img/appicon.png');

export default class EpisodeSingle extends Component {
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
    deviceId: '',
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
    logValue: '',
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
    offline: false,
    episodeCompleted: false,
    workOutCompleted: false,
    formattedWorkOutStartTime: 0,
    formattedWorkOutEndTime: 0,
    formattedTotalWorkOutTime: 0,
    trackingStarted: false,
    workOutTime: 0,
    showWelcomeDialog: false,
    showIntroAdvanceDialog: false,
    updateWatchedTimes: false,
    purchased: false,
    counter: 0,
    workOutEpisodeCompleted: false,
    sendDataToServer: false,
  };

  componentDidMount = () => {
    Orientation.unlockAllOrientations();
    this.props.navigation.setParams({ handleSave: this.navigateToEpisodeView });
    const platform = Platform.OS;
    const {
      check, episodeId, episodeIndex, seriesIndex, video, title, mode, category, advance, uid, deviceId, purchased, counter, offline, exercises, completeExercises,
    } = this.props.navigation.state.params;
    console.log(offline);
    const formattedFileName = title.replace(/ /g, '_');
    console.log(formattedFileName);
    const firstImage = offline ? ((exercises[0])[0]).cmsTitle : (completeExercises[exercises[0].uid]).image;
    const dirs = RNFetchBlob.fs.dirs.DocumentDir;
    // const { image, episodeExerciseTitle } = completeExercises[exercises[0].uid];
    this.setState({
      listen: check,
      episodeId,
      category,
      advance,
      episodeIndex,
      seriesIndex,
      platform,
      video: offline ? `${dirs}/AST/episodes/${formattedFileName}.mp4` : video,
      mode,
      episodeTitle: title,
      uid,
      deviceId,
      purchased,
      counter,
      offline,
      playingExercise: { value: { image: firstImage } },
    });
    if (platform === 'android') {
      GoogleFit.isEnabled((error, isEnabled) => {
        console.log(isEnabled);
        if (!isEnabled) {
          GoogleFit.authorize((authError, result) => {
            if (authError) {
              console.log(`AUTH ERROR ${authError}`);
            }
            console.log(`AUTH SUCCESS ${result}`);
          });
        }
      });
    }
    if (category === 'Speed') {
      this.setState({ showWelcomeDialog: true });
    } else {
      this.setState({ showIntroAdvanceDialog: true });
    }
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
    this.getTimeFirebase();
    this.formatWorkOutTime();
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
    MusicControl.updatePlayback({
      state: MusicControl.STATE_PAUSED,
      elapsedTime: this.state.currentTime,
    });
  }

  onExercisePress = () => {
    const { offline, advance } = this.state;
    const { video, image, title } = this.state.playingExercise.value;
    this.props.navigation.navigate('TalonIntelPlayer', {
      offline,
      exercise: true,
      mode: 'Exercise Player',
      video,
      exerciseTitle: offline ? image : title,
      episodeExerciseTitle: title,
      image,
      advance,
      navigateBack: 'EpisodeSingle',
      autoPlay: true,
    });
    this.setState({ paused: true });
  }

  onAppStateChange = (nextAppState) => {
    if (nextAppState === 'background') {
    }
  }

  onProgress = (data) => {
    const {
      paused, listen, playDate, currentTime, formattedWorkOutStartTime, trackingStarted, formattedWorkOutEndTime, offline,
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
      if (offline) {
        this.changeOfflineExercise();
      } else {
        this.changeExercises();
      }
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
      listen, logValue, formattedWorkOutEndTime,
    } = this.state;
    console.log(formattedWorkOutEndTime);
    const currentDate = this.getDate();
    this.registerEvents(data);
    if (listen) {
      const { currentTime, lastLoggedDate } = logValue;
      // if ((currentDate - lastLoggedDate) > 900000) {
      //   return this.setState({
      //     currentTime: 0.0,
      //     lastLoggedDate,
      //     totalLength: data.duration,
      //     loading: false,
      //   });
      // }
      console.log(currentTime);
      this.setState({
        currentTime,
        lastLoggedDate,
        totalLength: data.duration,
        loading: false,
        updateWatchedTimes: currentTime < 600 ? false : true,
      },
      () => {
        this.player.seek(this.state.currentTime, 10);
      });
    } else {
      const {
        dateNow, timeStamp, workOutTime, trackingStarted, workOutCompleted,
      } = logValue;
      console.log(timeStamp);
      if ((currentDate - dateNow) > 900000) {
        return this.setState({
          currentTime: 0.0,
          lastLoggedDate: dateNow,
          startDate: 0,
          playDate: currentDate,
          totalLength: data.duration,
          loading: false,
          workOutCompleted,
        });
      }
      this.setState({
        currentTime: timeStamp,
        lastLoggedDate: dateNow,
        startDate: dateNow,
        playDate: currentDate,
        totalLength: data.duration,
        loading: false,
        workOutTime,
        workOutCompleted,
        trackingStarted,
        updateWatchedTimes: timeStamp < 600 ? false : true,
        workOutEpisodeCompleted: timeStamp > formattedWorkOutEndTime ? true : false,
        sendDataToServer: timeStamp > formattedWorkOutEndTime ? true: false,
      }, () => {
        this.player.seek(this.state.currentTime, 10);
      });
    }
  };

  onEnd = () => {
    console.log('ON END');
    // this.player.seek(0, 0);
    this.updateMusicControl(0);
    this.setState({
      paused: true,
      currentTime: 0.0,
      episodeCompleted: true,
    });
    this.navigateToEpisodeView(true);
    // if (!this.state.listen) {
    //   this.navigateToEpisodeView(true);
    // }
  }

  onDragSeekBar = (currentTime) => {
    this.setState({ paused: true });
  }

  onPressPlay = () => {
    this.setState({ paused: false });
    const { startDate, currentTime } = this.state;
    MusicControl.updatePlayback({
      state: MusicControl.STATE_PLAYING,
      elapsedTime: currentTime,
    });
    if (!this.state.listen) {
      const currentDate = this.getDate();
      if ((currentDate - startDate) < 900000) {
        this.setState({ startDate });
        // this.startTrackingSteps();
        // }
      // } else {
      //   this.setState({ startDate: currentDate });
      // }
      }
    }
  }

  getCurrentTimeInMs = time => parseFloat(time, 10);

  setTimeFirebase = async () => {
    const {
      uid, episodeId, episodeTitle, distance, currentTime,
      lastLoggedDate, logId, steps, episodeIndex, seriesIndex,
      episodeCompleted, workOutCompleted, trackingStarted, workOutTime, category, listen, workOutEpisodeCompleted,
    } = this.state;
    const currentDate = this.getDate();
    if (listen) {
      await AsyncStorage.setItem(episodeTitle, JSON.stringify({
        currentTime,
        lastLoggedDate: currentDate,
      }));
      return;
    }
    // const startDate = await AsyncStorage.getItem(episodeId);
    // const storedEndDate = await AsyncStorage.getItem(`${episodeId}endDate`);
    // const workedOutToDate = workOutEpisodeCompleted ? storedEndDate : this.getDate();
    // const timeInterval = !trackingStarted
    //  ? 0
    //  : ((new Date(workedOutToDate).getTime() - new Date(startDate).getTime()) / 60000).toFixed(2);
    
    // const timeInterval = !trackingStarted ? 0 : (
    //   workOutEpisodeCompleted ? (formattedTotalWorkOutTime / 60).toFixed(2) : (workOutTime / 60).toFixed(2)
    // );

    const timeInterval = (workOutTime / 60).toFixed(2);

    // const workOutCompletedTime = !trackingStarted ? 0 : workOutTime;
    firebase.database().ref(`userDatas/${uid}/lastPlayedEpisode`).set(
      {
        episodeTitle,
        episodeId,
        episodeIndex,
        seriesIndex,
        episodeCompleted,
      },
    ).then(() => {
      if ((currentDate - lastLoggedDate) > 900000) {
        firebase.database().ref(`logs/${uid}/${episodeId}/`).push({
          timeStamp: currentTime,
          dateNow: currentDate,
          episodeTitle,
          distance,
          timeInterval,
          steps,
          episodeIndex,
          seriesIndex,
          trackingStarted,
          category,
          workOutTime,
          workOutCompleted,
        }).then(() => this.setState({ lastLoggedDate: currentDate, sendDataToServer: workOutEpisodeCompleted ? true : false }));
      } else {
        firebase.database().ref(`logs/${uid}/${episodeId}/${logId}`).set({
          timeStamp: currentTime,
          dateNow: currentDate,
          episodeTitle,
          distance,
          timeInterval,
          steps,
          episodeIndex,
          seriesIndex,
          category,
          trackingStarted,
          workOutTime,
          workOutCompleted,
        }).then(() => this.setState({ lastLoggedDate: currentDate, sendDataToServer: workOutEpisodeCompleted ? true : false }));
      }
    })
      .catch(error => console.log(error));
  }

  setEpisodeCompletedArray = (onEnd) => {
    const { uid, episodeId, episodeCompletedArray } = this.state;
    console.log(episodeCompletedArray);
    const found = episodeCompletedArray.some((el) => {
      return el.episodeId === episodeId;
    });
    console.log(found);
    if (!found) {
      firebase.database().ref(`userDatas/${uid}/episodeCompletedArray`).push(
        {
          episodeId,
        },
      );
    }
    if (onEnd) {
      this.setState({ showDialog: true });
    }
  }

  getDate = () => {
    const currentDate = new Date().getTime();
    return currentDate;
  }

  getLastLogId = (snapshot, episodeCompleted) => {
    const idArray = Object.keys(snapshot);
    const valueArray = Object.values(snapshot);
    const logId = idArray[idArray.length - 1];
    const logValue = valueArray[idArray.length - 1];
    this.setState({
      logId,
      logValue,
      loadScreen: false,
      episodeCompletedArray: episodeCompleted === null ? [] : (Object.values(episodeCompleted)),
    });
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
          this.setState({ logValue: toLogData, loadScreen: false });
        } else {
          this.setState({
            logValue: {
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
    firebase.database().ref(`userDatas/${uid}/episodeCompletedArray`).on('value', (snapCompletedEpisode) => {
      firebase.database().ref(`logs/${uid}/${episodeId}/`).on(
        'value', (snapshot) => {
          if (snapshot.val() === null) {
            firebase.database().ref(`logs/${uid}/${episodeId}/`).push({
              timeStamp: 0.0,
              dateNow: 0.0,
              episodeTitle: title,
              distance: 0.0,
              timeInterval: 0,
              steps: 0,
              episodeIndex,
              seriesIndex,
              trackingStarted: false,
              workOutTime: 0,
              category,
              workOutCompleted: false,
            }).then(() => {
              firebase.database().ref(`logs/${uid}/${episodeId}/`).on(
                'value', (snap) => {
                  this.getLastLogId(snap.val(), snapCompletedEpisode.val());
                },
              );
            })
              .catch(error => console.log(error));
          } else {
            this.getLastLogId(snapshot.val(), snapCompletedEpisode.val());
          }
        },
      );
    });
  }

  getStepCountAndDistance = async () => {
    console.log('GET STEP COUNT AND DISTANCE');
    const { category, platform, workOutEpisodeCompleted, sendDataToServer, episodeId } = this.state;
    if (sendDataToServer) {
      return;
    }
    const startDate = await AsyncStorage.getItem(episodeId);
    const storedEndDate = await AsyncStorage.getItem(`${episodeId}endDate`);
    if (platform === 'android') {
      const endDate = workOutEpisodeCompleted ? storedEndDate : new Date().toISOString();
      const options = {
        startDate,
        endDate, // required ISO8601Timestamp
      };
      if (category !== 'Speed') {
        // return this.storeDistance((new Date(endDate)).getTime() - (new Date(startDate)).getTime());
        return this.storeDistance();
      }
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
          const { distance } = response[0];
          this.setState({ distance, steps });
          // this.storeDistance((new Date(endDate)).getTime() - (new Date(startDate)).getTime());
          this.storeDistance();
        });
      });
    } else {
      const endDate = workOutEpisodeCompleted ? storedEndDate : new Date().getTime();
      const formattedDate = new Date(startDate).getTime();
      if (category !== 'Speed') {
        // return this.storeDistance(endDate - formattedDate);
        return this.storeDistance();
      }
      Pedometer.queryPedometerDataBetweenDates(
        formattedDate, endDate, (error, pedometerData) => {
          if (error) {
            return console.log(error);
          }
          const { distance, numberOfSteps } = pedometerData;
          this.setState({ steps: numberOfSteps, distance });
          // this.storeDistance(endDate - formattedDate);
          this.storeDistance();
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
          value: { image, title, episodeExerciseTitle, exerciseId: uid, video },
        },
      });
    } else {
      if (this.state.advance && advanced !== undefined) {
        this.setState({
          showInfo: true,
          playingExercise: {
            value: { image: advanced.image, title, episodeExerciseTitle, exerciseId: uid, video: advanced.video },
          },
        });
        return;
      }
      this.setState({
        showInfo: true,
        playingExercise: {
          value: { image, title, episodeExerciseTitle, exerciseId: uid, video },
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
    // MusicControl.handleAudioInterruptions(true);

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

    MusicControl.enableControl('previousTrack', !check);
    MusicControl.enableControl('skipBackward', check, { interval: 10 });
    MusicControl.enableControl('play', true);
    MusicControl.enableControl('pause', true);
    MusicControl.enableControl('skipForward', check, { interval: 10 }); // iOS only
    // MusicControl.enableControl('skipForward', true, { interval: 10 }); // for android only
    MusicControl.enableControl('closeNotification', true, { when: 'paused' });

    MusicControl.setNowPlaying({
      title,
      duration: data.duration,
      artwork: appicon,
      color: 0xFFFFFF,
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

  storeDistance = async () => {
    // console.log(timeInterval);
    const {
      uid, episodeId, episodeTitle, distance, currentTime, steps, episodeIndex, seriesIndex, workOutTime, episodeCompleted, workOutCompleted, category, trackingStarted,
    } = this.state;
    const timeInterval = (workOutTime / 60).toFixed(2);
    try {
      await AsyncStorage.setItem('distance', JSON.stringify({
        uid,
        episodeId,
        timeStamp: currentTime,
        workoutDate: new Date().getTime(),
        episodeTitle,
        distance,
        timeInterval,
        steps,
        episodeIndex,
        seriesIndex,
        workOutTime,
        episodeCompleted,
        workOutCompleted,
        trackingStarted,
        category,
      }));
    } catch (err) {
      console.log(err);
    }
  }

  formatWorkOutTime = () => {
    const { startWT, workoutTime, endWT } = this.props.navigation.state.params;
    const startWorkOutTimeArray = startWT.split(':');
    const formattedWorkOutStartTime = (parseInt(startWorkOutTimeArray[0], 10) * 3600) + (parseInt(startWorkOutTimeArray[1], 10) * 60) + (parseInt(startWorkOutTimeArray[2], 10));
    const totalWorkOutTimeArray = workoutTime.split(':');
    const formattedTotalWorkOutTime = (parseInt(totalWorkOutTimeArray[0], 10) * 3600) + (parseInt(totalWorkOutTimeArray[1], 10) * 60) + (parseInt(totalWorkOutTimeArray[2], 10));
    const endWorkOutTimeArray = endWT.split(':');
    const formattedWorkOutEndTime = (parseInt(endWorkOutTimeArray[0], 10) * 3600) + (parseInt(endWorkOutTimeArray[1], 10) * 60) + (parseInt(endWorkOutTimeArray[2], 10));
    this.setState({ formattedWorkOutStartTime, formattedTotalWorkOutTime, formattedWorkOutEndTime });
    console.log(formattedWorkOutStartTime);
  }

  navigateToEpisodeView = async (onEnd) => {
    const {
      listen, episodeCompleted, trackingStarted, workOutEpisodeCompleted,
    } = this.state;
    const {
      episodeIndex,
      episodeOneNotCompletedEmailTrigger,
    } = this.props.navigation.state.params;
    Orientation.lockToPortrait();
    try {
      if (listen) {
        this.setTimeFirebase();
      } else {
        const distance = await AsyncStorage.getItem('distance');
        if (distance !== null) {
          AsyncStorage.removeItem('distance');
        }
        if (!episodeCompleted && trackingStarted) {
          this.setTimeFirebase();
        }
        if (!workOutEpisodeCompleted) {
          if (episodeIndex === 10 && !episodeOneNotCompletedEmailTrigger) {
            this.setEmailData(false, episodeIndex, 'epOneNotCompleted', true, true);
          }
        }
        if (workOutEpisodeCompleted) {
          this.setEpisodeCompletedArray(onEnd);
        }
      }
      if (onEnd) {
        return console.log('EPISODE COMPLETED');
      }
      this.props.navigation.navigate('EpisodeView');
    } catch (error) {
      console.log(error);
    }
  }

  navigateToPreviousExercise = () => {
    const { previousStartTime } = this.state;
    const startTime = previousStartTime[previousStartTime.length - 1];
    this.setState({ currentTime: startTime === undefined ? 0 : startTime }, () => {
      const { currentTime } = this.state;
      console.log(currentTime);
      this.player.seek(currentTime, 10);
      this.updateMusicControl(currentTime);
      this.state.previousStartTime.pop(); // removes last item of array
    });
  }

  startTrackingSteps = async () => {
    console.log('START TRACKING');
    const startDate = new Date();
    try {
      if (this.state.platform === 'android') {
        await AsyncStorage.setItem(this.state.episodeId, startDate.toISOString()); // unique for different episodes
        GoogleFit.startRecording((event) => {});
      } else {
        await AsyncStorage.setItem(this.state.episodeId, startDate); // unique for different episodes
        Pedometer.startPedometerUpdatesFromDate(startDate, (pedometerData) => {
          console.log('PEDOMETER STARTED');
        });
      }
    } catch (error) {
      console.log('ERROR S T', error);
    }
  }

  updateWatchedTimes = () => {
    const { episodeId, deviceId, counter } = this.state;
    console.log('UPDATE WATCHED TIME');
    firebase.database().ref(`episodeWatchedCount/${deviceId}/${episodeId}/`).set({
      count: counter + 1,
    });
  }

  detectOrientation = () => {
    if (this.state.windowsHeight > this.state.windowsWidth) {
      return this.renderPortraitView();
    }
    return this.renderLandscapeView();
  };

  sendEmail = (episodeIndex, seriesBought, episodeCompleted) => {
    axios.post('https://us-central1-astraining-95c0a.cloudfunctions.net/sendMailChimp', {
      email: 'ab@a.com',
      episodeIndex: '2',
      seriesBought,
      episodeCompleted,
    })
      .then(response => Alert.alert(response.data))
      .catch(err => console.log(err));
  }

  setEmailData = (episodeCompleted, episodeIndex, sendTo, seriesBought, episodeOneNotCompletedEmailTrigger) => {
    firebase.database().ref(`userDatas/${this.props.screenProps.user.uid}/${sendTo}`).set({
      emailSent: '1',
    }).then(() => {
      this.sendEmail(episodeIndex, seriesBought, episodeCompleted);
      console.log('EMAIL TRIGGERED');
      if (episodeIndex === 10 && !episodeOneNotCompletedEmailTrigger) {
        firebase.database().ref(`userDatas/${this.props.screenProps.user.uid}/epOneNotCompleted`).set({
          emailSent: '1',
        });
      }
    });
  }

  triggerEmail = () => {
    const {
      episodeIndex,
      requestEmailTrigger,
      seriesBought,
      episodeOneNotCompletedEmailTrigger,
    } = this.props.navigation.state.params;
    if (requestEmailTrigger) {
      return;
    }
    if (episodeIndex === 10) {
      this.setEmailData(true, episodeIndex, 'epOneCompleted', seriesBought, episodeOneNotCompletedEmailTrigger);
    } else if (episodeIndex === 11) {
      this.setEmailData(true, episodeIndex, 'epTwoCompleted', seriesBought);
    } else if (episodeIndex === 2) {
      this.setEmailData(true, episodeIndex, 'epThreeCompleted', seriesBought);
    } else if (episodeIndex === 9) {
      this.setEmailData(true, episodeIndex, 'epTenCompleted', seriesBought);
    }
  }

  changeExercises = async () => {
    const { exercises, completeExercises } = this.props.navigation.state.params;
    if (exercises === undefined) {
      return;
    }
    const {
      formattedWorkOutStartTime, currentTime, listen,
      trackingStarted, updateWatchedTimes, purchased,
      formattedWorkOutEndTime, workOutEpisodeCompleted, platform,
      episodeId,
    } = this.state;
    // if (listen && (currentTime > formattedWorkOutStartTime) && !updateWatchedTimes && !purchased) {
    if ((currentTime > 600) && !updateWatchedTimes && !purchased) {
      this.updateWatchedTimes();
      this.setState({ updateWatchedTimes: true });
    }
    if (!listen && (currentTime > formattedWorkOutEndTime) && !workOutEpisodeCompleted) {
      await AsyncStorage.setItem(`${episodeId}endDate`, platform === 'android' ? new Date().toISOString() : new Date());
      this.triggerEmail();
      this.setState({ workOutEpisodeCompleted: true });
    }
    if (!listen && (currentTime > formattedWorkOutStartTime) && !trackingStarted) {
      this.startTrackingSteps();
      this.setState({ trackingStarted: true });
    }
    exercises.map((value, i) => {
      const { length, uid, episodeExerciseTitle } = value;
      if (currentTime > (length / 1000)) {
        this.setCurrentExercise(completeExercises[uid], uid, episodeExerciseTitle);
        this.state.previousStartTime.push((length / 1000));
      }
    });
  }

  changeOfflineExercise = async () => {
    const { exercises, exerciseLengthList } = this.props.navigation.state.params;
    if (exercises.length === 0) {
      return;
    }
    const {
      formattedWorkOutStartTime, currentTime, listen,
      trackingStarted, formattedWorkOutEndTime,
      workOutEpisodeCompleted, platform, episodeId,
    } = this.state;
    if (!listen && (currentTime > formattedWorkOutEndTime) && !workOutEpisodeCompleted) {
      await AsyncStorage.setItem(`${episodeId}endDate`, platform === 'android' ? new Date().toISOString() : new Date());
      this.triggerEmail();
      this.setState({ workOutEpisodeCompleted: true });
    }
    if (!listen && (currentTime > formattedWorkOutStartTime) && !trackingStarted) {
      // this.setLastPlayedEpisode();
      this.startTrackingSteps();
      this.setState({ trackingStarted: true });
    }
    exerciseLengthList.map((value, i) => {
      if (this.state.currentTime > (value / 1000)) {
        const exercise = exercises[i];
        const {
          cmsTitle, visible, title, episodeExerciseTitle, showInfo,
        } = exercise[0];
        // const showInfo = visible;
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

  renderLandscapeView = () => {
    const {
      playingExercise, listen, showInfo, loading, totalLength,
      currentTime, showDialog, episodeTitle, paused, trackingStarted,
      workOutTime, formattedTotalWorkOutTime, offline, advance,
      showWelcomeDialog, showIntroAdvanceDialog,
    } = this.state;
    const { image, episodeExerciseTitle } = playingExercise.value;
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
        } */}
        <View style={styles.line} />
        <View style={{ flex: 1, flexDirection: 'row', height: '100%' }}>
          <View style={{
            flex: 0.5, padding: moderateScale(5), height: '100%',
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
              offline={offline}
              advance={advance}
            />
          </View>
          <View style={{ marginTop: moderateScale(30), flex: 0.5, justifyContent: 'space-between' }}>
            <Text style={styles.textTitle}>
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
                    secondButtonText="Whoa, I'm with Flynn..."
                    buttonText="Hell yes, I'm with Bay!"
                    askAdvance
                    onPress={() => this.setState({ showIntroAdvanceDialog: false, advance: true })}
                    onSecondButtonPress={() => this.setState({ showIntroAdvanceDialog: false, advance: false })}
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
                            showImage
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
      playingExercise, listen, showInfo, loading, totalLength,
      currentTime, showDialog, episodeTitle, paused, trackingStarted,
      formattedTotalWorkOutTime, workOutTime, offline, advance,
      showWelcomeDialog, showIntroAdvanceDialog,
    } = this.state;
    const { image, episodeExerciseTitle } = playingExercise.value;
    return (
      <View>
        { loading
          ? <LoadScreen />
          : (
            <View style={{ height: '100%' }}>
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
                  paddingTop={moderateScale(20)}
                  offline={offline}
                  advance={advance}
                />
                <View style={styles.line} />
              </View>
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
                    secondButtonText="Whoa, I'm with Flynn..."
                    buttonText="Hell yes, I'm with Bay!"
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
                          showImage
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
                <Text style={styles.textTitle}>
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
            </View>
          )}
      </View>
    );
  }

  render() {
    const {
      video, loadScreen, paused, loading, platform,
    } = this.state;
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
        repeat={platform === 'android' ? false : true}
        playWhenInactive
        onLoad={this.onLoad}
        onEnd={this.onEnd}
        onProgress={this.onProgress}
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
        {videoPlayer}
      </View>
    );
  }
}
