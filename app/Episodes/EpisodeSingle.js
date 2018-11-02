import React, { Component } from 'react';
import {
  AppState, View, ScrollView, Modal, Platform, AsyncStorage, BackHandler,
} from 'react-native';
import { Text, Button, Icon } from 'react-native-elements';
import Video from 'react-native-video';
import Pedometer from 'react-native-pedometer';
import GoogleFit from 'react-native-google-fit';
import Orientation from 'react-native-orientation';
import firebase from '../config/firebase';
import AlbumArt from '../common/AlbumArt';
import Controls from '../common/Controls';
import Seekbar from '../common/Seekbar';
import Loading from '../common/Loading';
import LoadScreen from '../common/LoadScreen';
import FormatTime from '../common/FormatTime';

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#001331',
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
    paddingBottom: 10,
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
const albumImage = 'https://firebasestorage.googleapis.com/v0/b/astraining-95c0a.appspot.com/o/talon%2Ftalondark.png?alt=media&token=fdaf448b-dc43-4a72-a9e3-470aa68d9390';

export default class EpisodeSingle extends Component {
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
  };

  componentWillMount() {
    const platform = Platform.OS;
    const {
      check, episodeId, episodeIndex, seriesIndex, video, title, mode, category, advance,
    } = this.props.navigation.state.params;
    this.setState({
      listen: check,
      episodeId,
      category,
      advance,
      episodeIndex,
      seriesIndex,
      platform,
      video,
      mode,
      episodeTitle: title,
      uid: this.props.screenProps.user.uid,
      playingExercise: { value: { image: albumImage, title: '' } },
    });
  }

  componentDidMount = async () => {
    const { platform, listen } = this.state;
    Orientation.unlockAllOrientations();
    if (platform === 'android') {
      GoogleFit.authorize((error, result) => {
        if (error) {
          console.log(`AUTH ERROR ${error}`);
        }
        console.log(`AUTH SUCCESS ${result}`);
      });
      GoogleFit.onAuthorize(() => {
        console.log('AUTH SUCCESS');
      });
  
      GoogleFit.onAuthorizeFailure(() => {
        console.log('AUTH FAILED');
      });
    }
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
    if (listen) {
      return this.setState({ loadScreen: false });
    }
    this.formatWorkOutTime();
    this.getTimeFirebase();
    console.log(this.state.episodeCompletedArray);
    const episodeCompletedArray = await AsyncStorage.getItem('episodeCompletedArray');
    if (episodeCompletedArray !== null) {
      console.log(episodeCompletedArray);
      this.setState({ episodeCompletedArray: JSON.parse(episodeCompletedArray) });
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
  }

  onForward = () => {
    const { currentTime } = this.state;
    this.setState({ currentTime: currentTime + 10 });
    this.player.seek(currentTime + 10, 10);
  }

  onPressPause = () => {
    this.setState({ paused: true });
  }

  onExercisePress = () => {
    const { video, image, title } = this.state.playingExercise.value;
    this.props.navigation.navigate('TalonIntelPlayer', {
      exercise: true,
      video,
      exerciseTitle: title,
      image,
      mode: 'Exercise Player',
    });
    this.setState({ paused: true });
  }

  onAppStateChange = (nextAppState) => {
    if (nextAppState === 'background') {
    }
  }

  onProgress = (data) => {
    const {
      paused, listen, playDate, currentTime, formattedWorkOutStartTime, trackingStarted, formattedWorkOutEndTime, workOutCompleted,
    } = this.state;
    if (!paused) { // onProgress gets called when component starts in IOS
      if (trackingStarted) {
        if ((data.currentTime - formattedWorkOutEndTime) >= 0) {
          this.setState({ currentTime: data.currentTime, workOutCompleted: true });
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
      uid, episodeId, logId,
    } = this.state;
    console.log(data);
    this.setState({ totalLength: data.duration });
    if (this.state.listen) {
      this.setState({ currentTime: this.getCurrentTimeInMs(0.0) });
    } else {
      firebase.database().ref(`logs/${uid}/${episodeId}/${logId}`).on('value', (snapshot) => {
        const { dateNow, timeStamp, workOutTime } = snapshot.val();
        const currentDate = this.getDate();
        if ((currentDate - dateNow) > 900000) {
          return this.setState({
            currentTime: this.getCurrentTimeInMs(0.0),
            lastLoggedDate: dateNow,
            startDate: 0,
            playDate: currentDate,
          });
        }
        this.setState({
          currentTime: this.getCurrentTimeInMs(timeStamp),
          lastLoggedDate: dateNow,
          startDate: dateNow,
          playDate: currentDate,
          workOutTime,
        },
        () => {
          // this.changeExercises();
          this.player.seek(this.state.currentTime, 10);
        });
      }, (error) => {
        console.log(error);
      });
    }
    this.setState({ loading: false });
  };

  onEnd = () => {
    // this.player.seek(0, 0);
    this.setState({ paused: true, currentTime: 0.0, episodeCompleted: true });
    if (!this.state.listen) {
      this.navigateToEpisodeView(true);
    }
  }

  onDragSeekBar = (currentTime) => {
    this.setState({ paused: true });
  }

  onPressPlay = () => {
    this.setState({ paused: false });
    const { startDate } = this.state;
    if (!this.state.listen) {
      const currentDate = this.getDate();
      if ((currentDate - startDate) < 900000) {
        this.setState({ startDate, trackingStarted: true });
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
      uid, episodeId, episodeTitle, distance, currentTime, lastLoggedDate, logId, steps, episodeIndex, seriesIndex, episodeCompleted, workOutCompleted, trackingStarted, workOutTime,
    } = this.state;
    const currentDate = this.getDate();
    const startDate = await AsyncStorage.getItem(episodeId);
    console.log(startDate);
    const timeInterval = !trackingStarted
      ? 0
      : ((currentDate - new Date(startDate).getTime()) / 60000).toFixed(2);
    firebase.database().ref(`users/${uid}/lastPlayedEpisode`).set(
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
          workOutTime,
          workOutCompleted,
        }).then(() => this.setState({ lastLoggedDate: currentDate }));
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
          workOutTime,
          workOutCompleted,
        }).then(() => this.setState({ lastLoggedDate: currentDate }));
      }
    })
      .catch(error => console.log(error));
  }

  getDate = () => {
    const currentDate = new Date().getTime();
    return currentDate;
  }

  getLastLogId = (snapshot) => {
    const array = Object.keys(snapshot);
    const id = array[array.length - 1];
    this.setState({ logId: id, loadScreen: false });
  }

  getTimeFirebase = () => {
    const {
      uid, episodeId, episodeTitle, episodeIndex, seriesIndex, workOutCompleted,
    } = this.state;
    // firebase.database().ref(`users/${uid}/lastPlayedEpisode`).set(
    //   {
    //     episodeTitle,
    //     episodeId,
    //     category,
    //   },
    // ).then(() => {
    firebase.database().ref(`logs/${uid}/${episodeId}/`).on(
      'value', (snapshot) => {
        if (snapshot.val() === null) {
          firebase.database().ref(`logs/${uid}/${episodeId}/`).push({
            timeStamp: 0.0,
            dateNow: 0.0,
            episodeTitle,
            distance: 0.0,
            timeInterval: 0,
            steps: 0,
            episodeIndex,
            seriesIndex,
            workOutTime: 0,
            workOutCompleted,
          }).then(() => {
            firebase.database().ref(`logs/${uid}/${episodeId}/`).on(
              'value', (snap) => {
                this.getLastLogId(snap.val());
              },
            );
          })
            .catch(error => console.log(error));
        } else {
          this.getLastLogId(snapshot.val());
        }
      }
    );
    // })
  }

  getStepCountAndDistance = async () => {
    console.log('GET STEP COUNT AND DISTANCE');
    const startDate = await AsyncStorage.getItem(this.state.episodeId);
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
          this.storeDistance((new Date(endDate)).getTime() - (new Date(startDate)).getTime());
        });
      });
    } else {
      const endDate = new Date().getTime();
      const formattedDate = new Date(startDate).getTime();
      Pedometer.queryPedometerDataBetweenDates(
        formattedDate, endDate, (error, pedometerData) => {
          if (error) {
            console.log(error);
          }
          const { distance, numberOfSteps } = pedometerData;
          this.setState({ steps: numberOfSteps, distance: (distance / 1000).toFixed(2) });
          this.storeDistance(endDate - formattedDate);
        },
      );
    }
  };

  setCurrentExercise = (snapshot, uid) => {
    const { image, title, advanced, video } = snapshot;
    if (video === '') {
      this.setState({
        showInfo: false,
        playingExercise: {
          value: { image, title, exerciseId: uid, video },
        },
      });
    } else {
      if (this.state.advance && advanced !== undefined) {
        this.setState({
          showInfo: true,
          playingExercise: {
            value: { image: advanced.image, title, exerciseId: uid, video: advanced.video },
          },
        });
        return;
      }
      this.setState({
        showInfo: true,
        playingExercise: {
          value: { image, title, exerciseId: uid, video },
        },
      });
    }
  }

  sliderReleased = (currentTime) => {
    this.setState({ paused: false, currentTime });
    this.player.seek(currentTime);
  }

  storeDistance = async (timeInterval) => {
    console.log(timeInterval);
    const {
      uid, episodeId, episodeTitle, distance, currentTime, steps, episodeIndex, seriesIndex, workOutTime, episodeCompleted, workOutCompleted,
    } = this.state;
    try {
      await AsyncStorage.setItem('distance', JSON.stringify({
        uid,
        episodeId,
        timeStamp: currentTime,
        dateNow: new Date().getTime(),
        episodeTitle,
        distance,
        timeInterval,
        steps,
        episodeIndex,
        seriesIndex,
        workOutTime,
        episodeCompleted,
        workOutCompleted,
      }));
    } catch (err) {
      console.log(err);
    }
  }

  formatWorkOutTime = () => {
    const { startWT, workoutTime, endWT } = this.props.navigation.state.params;
    const startWorkOutTimeArray = startWT.split(':');
    const formattedWorkOutStartTime = (parseInt(startWorkOutTimeArray[0], 16) * 3600) + (parseInt(startWorkOutTimeArray[1], 16) * 60) + (parseInt(startWorkOutTimeArray[2], 10));
    const totalWorkOutTimeArray = workoutTime.split(':');
    const formattedTotalWorkOutTime = (parseInt(totalWorkOutTimeArray[0], 16) * 3600) + (parseInt(totalWorkOutTimeArray[1], 16) * 60) + (parseInt(totalWorkOutTimeArray[2], 10));
    const endWorkOutTimeArray = endWT.split(':');
    const formattedWorkOutEndTime = (parseInt(endWorkOutTimeArray[0], 16) * 3600) + (parseInt(endWorkOutTimeArray[1], 16) * 60) + (parseInt(endWorkOutTimeArray[2], 10));
    this.setState({ formattedWorkOutStartTime, formattedTotalWorkOutTime, formattedWorkOutEndTime });
  }

  navigateToEpisodeView = async (onEnd) => {
    const { listen, episodeCompletedArray, episodeId } = this.state;
    Orientation.lockToPortrait();
    try {
      if (!listen) {
        const distance = await AsyncStorage.getItem('distance');
        console.log(distance);
        if (distance !== null) {
          AsyncStorage.removeItem('distance');
        }
        this.setTimeFirebase();
        if (onEnd) {
          console.log(episodeCompletedArray);
          episodeCompletedArray.push(episodeId);
          console.log(episodeCompletedArray);
          try {
            await AsyncStorage.setItem('episodeCompletedArray', JSON.stringify(episodeCompletedArray));
          } catch (err) {
            console.log(err);
          }
          return this.setState({ showDialog: true });
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
    this.setState({ currentTime: startTime });
    this.player.seek(startTime, 10);
    this.state.previousStartTime.pop(); // removes last item of array
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

  showModal = () => {
    const { showDialog, episodeId } = this.state;
    if (showDialog) {
      return (
        <Modal transparent visible={this.state.showDialog}>
          <View style={styles.modal}>
            <View style={styles.modalInnerView}>
              <View style={{ justifyContent: 'center' }}>
                <Text h4 style={{ color: '#001331' }}>
                Well done! Workout complete.
                </Text>
                <Text style={{ color: '#001331', fontSize: 16 }}>
                Go to TALON to check your workout results
                </Text>
              </View>
              <Button
                buttonStyle={styles.button}
                title="Ok"
                color="#fff"
                onPress={() => {
                  this.setState({ showDialog: false });
                  this.props.navigation.navigate('TalonIntelPlayer', { episodeId, talon: true, mode: 'Talon Intel Player' });
                }}
              />
            </View>
          </View>
        </Modal>
      );
    }
  }

  detectOrientation = () => {
    if (this.state.windowsHeight > this.state.windowsWidth) {
      return this.renderPortraitView();
    }
    return this.renderLandscapeView();
  };

  changeExercises = () => {
    const { exercises, completeExercises } = this.props.navigation.state.params;
    const {
      formattedWorkOutStartTime, currentTime, listen, trackingStarted, workOutTime,
    } = this.state;
    if (!listen && (currentTime > formattedWorkOutStartTime) && !trackingStarted) {
      this.startTrackingSteps();
      this.setState({ trackingStarted: true });
    }
    exercises.map((value, i) => {
      const { length, uid } = value;
      if (currentTime > (length / 1000)) {
        this.setCurrentExercise(completeExercises[uid], uid);
        this.state.previousStartTime.push((length / 1000));
      }
    });
  }

  handleBackButton = () => {
    return true;
  }

  renderLandscapeView = () => {
    const {
      platform, playingExercise, listen, mode, showInfo, loading, totalLength, currentTime, showDialog, episodeTitle, paused, trackingStarted, workOutTime, formattedTotalWorkOutTime,
    } = this.state;
    const { image, title } = playingExercise.value;
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
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <View style={{
            flex: 0.5, padding: 20,
          }}
          >
            <AlbumArt
              url={
              playingExercise
                ? image
                : null
              }
              currentExercise={title}
              onPress={this.onExercisePress}
              showInfo={showInfo}
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
                  <View>
                    { !listen && showDialog
                      ? (
                        <View>
                          {this.showModal()}
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
      platform, playingExercise, listen, mode, showInfo, loading, totalLength, currentTime, showDialog, episodeTitle, paused, trackingStarted, formattedTotalWorkOutTime, workOutTime,
    } = this.state;
    const { image, title } = playingExercise.value;
    return (
      <View>
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
            currentExercise={title}
            onPress={this.onExercisePress}
            showInfo={showInfo}
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
                { !listen && showDialog
                  ? (
                    <View>
                      {this.showModal()}
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
        repeat={false}
        playWhenInactive
        onLoad={this.onLoad}
        onEnd={this.onEnd}
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
        {this.detectOrientation()}
        {videoPlayer}
      </ScrollView>
    );
  }
}
