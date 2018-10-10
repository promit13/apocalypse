import React, { Component } from 'react';
import {
  AppState, View, ScrollView, Modal, Platform, AsyncStorage,
} from 'react-native';
import { Text, Button, Icon } from 'react-native-elements';
import Video from 'react-native-video';
import Pedometer from 'react-native-pedometer';
import GoogleFit from 'react-native-google-fit';
import firebase from '../config/firebase';
import AlbumArt from '../common/AlbumArt';
import Controls from '../common/Controls';
import Seekbar from '../common/Seekbar';
import Loading from '../common/Loading';
import FormatTime from '../common/FormatTime';
import AndroidTrack from '../More/AndroidTrack';
import IosTrack from '../More/IosTrack';

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#001331',
  },
  containerInner: {
    marginTop: 30,
  },
  textTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
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
    paused: true,
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
    playDate: 0,
    pausedDate: 0,
    startDate: 0,
    timeInterval: 0,
    video: '',
    category: '',
    advance: false,
    distance: 0.0,
    mode: '',
    platform: '',
  };

  componentWillMount() {
    const platform = Platform.OS;
    const {
      check, episodeId, index, video, title, mode, category, advance,
    } = this.props.navigation.state.params;
    // const currentDate = this.getDate();
    this.setState({
      listen: check,
      episodeId,
      category,
      advance,
      platform,
      video,
      mode,
      episodeTitle: title,
      uid: this.props.screenProps.user.uid,
      playingExercise: { value: { image: albumImage, title: '' } },
      // currentDate,
    });
  }

  componentDidMount = async () => {
    if (this.state.platform === 'android') {
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

    // try {
    //   const currentDate = this.getDate();
    //   const startDate = await AsyncStorage.getItem(this.state.episodeId);
    //   const formattedDate = new Date(startDate).getTime();
    //   if (startDate !== null) {
    //     if ((currentDate - formattedDate) < 900000) {
    //       console.log('CDM CD', currentDate);
    //       this.setState({ startDate: currentDate });
    //     } else {
    //       console.log('CDM FD', currentDate);
    //       this.setState({ startDate: formattedDate });
    //     }
    //   }
    // } catch (err) {
    //   console.log(err);
    // }
    this.getTimeFirebase();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.currentTime > 0) {
      // this.changeExercises;
    }
  }

  componentWillUnmount() {
    GoogleFit.unsubscribeListeners();
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
    const currentDate = this.getDate();
    this.setState({ paused: true, pausedDate: currentDate });
    // if (!this.state.listen) {
    //   this.setTimeFirebase();
    // }
    // this.changeExercises();
  }

  onExercisePress = () => {
    const { exerciseId } = this.state.playingExercise.value;
    this.props.navigation.navigate('ExercisePlayer', { exerciseId, advance: this.state.advance });
    this.setState({ paused: true });
    // this.getDistance();
  }

  onAppStateChange = (nextAppState) => {
    if (nextAppState === 'background') {
    }
  }

  onProgress = (data) => {
    this.setState({ currentTime: data.currentTime });
    this.changeExercises();
    if (!this.state.listen) {
      if (!this.state.paused) { // onProgress gets called when component starts in IOS
        const currentDate = this.getDate();
        if ((currentDate - this.state.playDate) > 60000) {
          // this.setTimeFirebase();
          // this.getDistance();
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
    const { uid, episodeId, logId } = this.state;
    this.setState({ totalLength: data.duration });
    if (this.state.listen) {
      this.setState({ currentTime: this.getCurrentTimeInMs(0.0) });
    } else {
      firebase.database().ref(`logs/${uid}/${episodeId}/${logId}`).on('value', (snapshot) => {
        const { dateNow, timeStamp } = snapshot.val();
        const currentDate = this.getDate();
        // if (snapValue === null) {
        //   return this.setState({ currentTime: this.getCurrentTimeInMs(0.0), lastLoggedDate: currentDate, startDate: 0 });
        // }
        if ((currentDate - dateNow) > 900000) {
          return this.setState({ currentTime: this.getCurrentTimeInMs(0.0), lastLoggedDate: dateNow, startDate: 0, playDate: currentDate });
        }
        this.setState({
          currentTime: this.getCurrentTimeInMs(timeStamp),
          lastLoggedDate: dateNow,
          startDate: dateNow,
          playDate: currentDate,
        },
        () => {
          this.changeExercises();
          this.player.seek(this.state.currentTime, 10);
        });
      }, (error) => {
        console.log(error);
      });
    }
    this.setState({ loading: false });
  };

  onEnd = () => {
    this.player.seek(0, 10);
    this.setState({ paused: true, currentTime: 0.0 });
    if (!this.state.listen) {
      this.setTimeFirebase();
      // AsyncStorage.removeItem(this.state.episodeId);
      this.setState({ showDialog: true });
    }
  }

  onDragSeekBar = (currentTime) => {
    this.setState({ currentTime });
    this.player.seek(currentTime, 100);
  }

  onPressPlay = () => {
    this.setState({ paused: false });
    const { startDate, pausedDate } = this.state;
    if (!this.state.listen) {
      const currentDate = this.getDate();
      if ((currentDate - startDate) > 900000) {
        this.setState({ startDate: currentDate });
        this.startTrackingSteps();
        // }
      }
    }
  }

  getCurrentTimeInMs = time => parseInt(time, 10);

  setTimeFirebase = async () => {
    const {
      uid, episodeId, episodeTitle, distance, currentTime, lastLoggedDate, logId,
    } = this.state;
    const currentDate = this.getDate();
    const startDate = await AsyncStorage.getItem(episodeId);
    const timeInterval = ((currentDate - new Date(startDate).getTime()) / 60000).toFixed(2);
    // const distance = this.child.getState();
    if ((currentDate - lastLoggedDate) > 900000) {
      firebase.database().ref(`logs/${uid}/${episodeId}/`).push({
        timeStamp: currentTime,
        dateNow: currentDate,
        episodeTitle,
        distance,
        timeInterval,
      }).then(() => this.setState({ lastLoggedDate: currentDate, timeInterval }));
    } else {
      firebase.database().ref(`logs/${uid}/${episodeId}/${logId}`).set({
        timeStamp: currentTime,
        dateNow: currentDate,
        episodeTitle,
        distance,
        timeInterval,
      }).then(() => this.setState({ lastLoggedDate: currentDate, timeInterval }));
    }
  }

  getDate = () => {
    const currentDate = new Date().getTime();
    return currentDate;
  }

  getLastLogId = (snapshot) => {
    const array = Object.keys(snapshot);
    const id = array[array.length - 1];
    this.setState({ logId: id });
  }

  getTimeFirebase = async () => {
    const { uid, episodeId, episodeTitle } = this.state;
    const currentDate = this.getDate();
    firebase.database().ref(`logs/${uid}/${episodeId}/`).on(
      'value', (snapshot) => {
        if (snapshot.val() === null) {
          firebase.database().ref(`logs/${uid}/${episodeId}/`).push({
            timeStamp: 0.0,
            dateNow: 0,
            episodeTitle,
            distance: 0.0,
            timeInterval: 0,
          }).then(() => {
            firebase.database().ref(`logs/${uid}/${episodeId}/`).on(
              'value', (snap) => {
                this.getLastLogId(snap.val());
              },
            );
          });
        } else {
          this.getLastLogId(snapshot.val());
        }
      }, (error) => {
        console.log(error);
      },
    );
  }

  getStepCountAndDistance = async () => {
    const startDate = await AsyncStorage.getItem(this.state.episodeId);
    if (this.state.platform === 'android') {
      const endDate = new Date().toISOString();
      const options = {
        startDate,
        endDate, // required ISO8601Timestamp
      };
      GoogleFit.getDailyDistanceSamples(options, (error, response) => {
        if (error) {
          return console.log(error);
          // throw error;
        }
        const distance = ((response[0].distance) / 1000).toFixed(2);
        this.setState({ distance });
        this.storeDistance(new Date(endDate - startDate).getTime());
      });
    } else {
      const endDate = new Date().getTime();
      const formattedDate = new Date(startDate).getTime();
      Pedometer.queryPedometerDataBetweenDates(
        formattedDate, endDate, (error, pedometerData) => {
          if (error) {
            console.log(error);
          }
          const { distance } = pedometerData;
          this.setState({ distance: (distance / 1000).toFixed(2) });
          this.storeDistance(endDate - formattedDate);
        },
      );
    }
  };

  setCurrentExercise = (snapshot, uid) => {
    const { image, title, advanced } = snapshot;
    if (this.state.advance && advanced !== null) {
      this.setState({
        playingExercise: {
          value: { image: advanced.image, title, exerciseId: uid },
        },
      });
      return;
    }
    this.setState({
      playingExercise: {
        value: { image, title, exerciseId: uid },
      },
    });
  }

  storeDistance = async (timeInterval) => {
    console.log(timeInterval);
    const {
      uid, episodeId, episodeTitle, distance, currentTime,
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
      }));
    } catch (err) {
      console.log(err);
    }
  }

  navigateToEpisodeView = async () => {
    try {
      const distance = await AsyncStorage.getItem('distance');
      if (distance !== null) {
        this.setTimeFirebase();
        AsyncStorage.removeItem('distance');
      }
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
    const startDate = new Date();
    try {
      if (this.state.platform === 'android') {
        await AsyncStorage.setItem(this.state.episodeId, startDate.toISOString()); // unique for different episodes
        GoogleFit.startRecording((event) => {});
      } else {
        await AsyncStorage.setItem(this.state.episodeId, startDate); // unique for different episodes
        Pedometer.startPedometerUpdatesFromDate(startDate, (pedometerData) => {
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
                  this.props.navigation.navigate('TalonIntelPlayer', { episodeId });
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
    const { exercises } = this.props.navigation.state.params;
    exercises.map((value, i) => {
      const { length, uid } = value;
      if (this.state.currentTime > length) {
        firebase.database().ref(`exercises/${uid}`).on('value', (snapshot) => {
          this.setCurrentExercise(snapshot.val(), uid);
        });
        this.state.previousStartTime.push(length);
      }
    });
  }

  renderLandscapeView = () => {
    const { image, title } = this.state.playingExercise.value;
    return (
      <View style={{ flex: 1 }}>
        { this.state.platform === 'android'
          ? (
            <View style={styles.headerView}>
              <Icon
                iconStyle={{ marginLeft: 15 }}
                name="arrow-left"
                type="material-community"
                size={25}
                color="white"
                onPress={() => {
                  if (!this.state.listen) {
                    this.navigateToEpisodeView();
                  }
                  this.props.navigation.navigate('EpisodeView');
                }}
              />
              <Text style={[styles.textTitle, { marginLeft: 20, fontSize: 20 }]}>
                {this.state.mode}
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
                onPress={() => {
                  if (!this.state.listen) {
                    this.navigateToEpisodeView();
                  }
                  this.props.navigation.navigate('EpisodeView');
                }}
              />
              <View style={{ flex: 1, marginLeft: -10 }}>
                <Text style={[styles.textTitle, { fontSize: 18 }]}>
                  {this.state.mode}
                </Text>
              </View>
            </View>
          )
        }
        <View style={{ flex: 1, flexDirection: 'row' }}>
          {/* {
            Platform.OS === 'android'
              ? <AndroidTrack ref={c => this.child = c} />
              : <IosTrack ref={c => this.child = c} />
          } */}
          <View style={{
            flex: 0.5, backgroundColor: '#33425a', padding: 20,
          }}
          >
            <AlbumArt
              url={
              this.state.playingExercise
                ? image
                : null
              }
              currentExercise={title}
              onPress={this.onExercisePress}
              showInfo
            />
          </View>
          <View style={{ flex: 0.5, justifyContent: 'space-between' }}>
            <Text style={styles.textTitle}>
              {this.state.episodeTitle}
            </Text>
            <Controls
              onPressPlay={this.onPressPlay}
              onPressPause={this.onPressPause}
              onBack={this.onBack}
              onForward={this.onForward}
              onDownload={this.onDownload}
              paused={this.state.paused}
              navigateToPreviousExercise={this.navigateToPreviousExercise}
              renderForwardButton={this.state.listen}
            />
            { this.state.loading
              ? <Loading />
              : (
                <View>
                  { this.state.listen
                    ? (
                      <Seekbar
                        totalLength={this.state.totalLength}
                        onDragSeekBar={this.onDragSeekBar}
                        seekValue={this.state.currentTime && this.state.currentTime}
                      />
                    )
                    : (
                      <View>
                        { this.state.showDialog
                          ? (
                            <View>
                              {this.showModal()}
                            </View>
                          )
                          : null
                      }
                      </View>
                    )
                  }
                  <FormatTime
                    currentTime={this.state.currentTime}
                    remainingTime={this.state.totalLength - this.state.currentTime}
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
    const { image, title } = this.state.playingExercise.value;
    return (
      <View>
        {/* {
          Platform.OS === 'android'
            ? <AndroidTrack ref={c => this.child = c} />
            : <IosTrack ref={c => this.child = c} />
        } */}
        { this.state.platform === 'android'
          ? (
            <View style={styles.headerView}>
              <Icon
                iconStyle={{ marginLeft: 15 }}
                name="arrow-left"
                type="material-community"
                size={25}
                color="white"
                underlayColor="#001331"
                onPress={() => {
                  if (!this.state.listen) {
                    this.navigateToEpisodeView();
                  }
                  this.props.navigation.navigate('EpisodeView');
                }}
              />
              <Text style={[styles.textTitle, { marginLeft: 20, fontSize: 20 }]}>
                {this.state.mode}
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
                onPress={() => {
                  if (!this.state.listen) {
                    this.navigateToEpisodeView();
                  }
                  this.props.navigation.navigate('EpisodeView');
                }}
              />
              <View style={{ flex: 1, marginLeft: -10 }}>
                <Text style={[styles.textTitle, { fontSize: 18 }]}>
                  {this.state.mode}
                </Text>
              </View>
            </View>
          )
          }
        <View style={styles.albumView}>
          <AlbumArt
            url={
             this.state.playingExercise
               ? image
               : null
            }
            currentExercise={title}
            onPress={this.onExercisePress}
            showInfo
          />
        </View>
        <View style={styles.line} />
        { this.state.loading
          ? <Loading />
          : (
            <View>
              { this.state.listen
                ? (
                  <Seekbar
                    totalLength={this.state.totalLength}
                    onDragSeekBar={this.onDragSeekBar}
                    seekValue={this.state.currentTime && this.state.currentTime}
                  />
                )
                : (
                  <View>
                    { this.state.showDialog
                      ? (
                        <View>
                          {this.showModal()}
                        </View>
                      )
                      : null
                  }
                  </View>
                )
              }
              <FormatTime
                currentTime={this.state.currentTime}
                remainingTime={this.state.totalLength - this.state.currentTime}
              />
              <Text style={styles.textTitle}>
                {this.state.episodeTitle}
              </Text>
              <Controls
                onPressPlay={this.onPressPlay}
                onPressPause={this.onPressPause}
                onBack={this.onBack}
                onForward={this.onForward}
                onDownload={this.onDownload}
                paused={this.state.paused}
                navigateToPreviousExercise={this.navigateToPreviousExercise}
                renderForwardButton={this.state.listen}
              />
            </View>
          )
        }
      </View>
    );
  }

  render() {
    const video = (
      <Video
        source={{ uri: this.state.video }} // 'https://firebasestorage.googleapis.com/v0/b/astraining-95c0a.appspot.com/o/temp%2Fcrowd-cheering.mp3?alt=media&token=def168b4-c566-4555-ab22-a614106298a5'
        ref={(ref) => {
          this.player = ref;
        }}
        progressUpdateInterval={50.0}
        paused={this.state.paused} // Pauses playback entirely.
        resizeMode="cover" // Fill the whole screen at aspect ratio.
        playInBackground
        ignoreSilentSwitch="ignore"
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
        {video}
      </ScrollView>
    );
  }
}
