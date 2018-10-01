import React, { Component } from 'react';
import {
  AppState, View, ScrollView, Modal, Platform,
} from 'react-native';
import { Text, Button } from 'react-native-elements';
import Video from 'react-native-video';
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
};
const albumImage = 'https://firebasestorage.googleapis.com/v0/b/astraining-95c0a.appspot.com/o/talon%2Ftalondark.png?alt=media&token=fdaf448b-dc43-4a72-a9e3-470aa68d9390';

export default class EpisodeSingle extends Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.getParam('mode', ''),
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
    video: '',
  };

  componentWillMount() {
    const {
      check, episodeId, index, video, title,
    } = this.props.navigation.state.params;
    // const currentDate = this.getDate();
    this.setState({
      listen: check,
      episodeId,
      video,
      episodeTitle: title,
      uid: this.props.screenProps.user.uid,
      playingExercise: { value: { image: albumImage, title: '' } },
      // currentDate,
    });
  }

  componentDidMount() {
    this.getTimeFirebase();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.currentTime > 0) {
      // this.changeExercises;
    }
  }

  componentWillUnmount() {
    
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
    this.getDistance();
    this.changeExercises();
  }

  onExercisePress = () => {
    const { exerciseId } = this.state.playingExercise.value;
    this.props.navigation.navigate('ExercisePlayer', { exerciseId });
    this.setState({ paused: true });
    this.getDistance();
  }

  onAppStateChange = (nextAppState) => {
    if (nextAppState === 'background') {
    }
  }

  onProgress = (data) => {
    this.setState({ currentTime: data.currentTime });
    this.changeExercises();
    if (!this.state.paused) { // onProgress gets called when component starts in IOS
      const currentDate = this.getDate();
      if ((currentDate - this.state.playDate) > 15000) {
        console.log('CHECK');
        this.getDistance();
        this.setState({ playDate: currentDate });
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
        const snapValue = snapshot.val();
        const currentDate = this.getDate();
        if (snapValue === null || (currentDate - snapValue.dateNow) > 900000) {
          return this.setState({ currentTime: this.getCurrentTimeInMs(0.0), lastLoggedDate: currentDate });
        }
        this.setState({
          currentTime: this.getCurrentTimeInMs(snapValue.timeStamp),
          lastLoggedDate: snapValue.dateNow,
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
    this.setState({ showDialog: true, paused: true, currentTime: 0.0 });
    this.player.seek(0, 10);
    this.getDistance();
  }

  onDragSeekBar = (currentTime) => {
    this.setState({ currentTime });
    this.player.seek(currentTime, 10);
  }

  onPressPlay = () => {
    this.setState({ paused: false });
    if (!this.state.listen) {
      const currentDate = this.getDate();
      if ((currentDate - this.state.pausedDate) > 900000) {
        this.setState({ startDate: currentDate, playDate: currentDate });
        this.child.startTrackingSteps();
      }
    }
  }

  getDistance = () => {
    this.child.getStepCountAndDistance();
    console.log('getDistance');
    setTimeout(() => {
      this.setTimeFirebase();
    }, 3000);
    // this.setTimeFirebase();
  }

  getCurrentTimeInMs = time => parseInt(time, 10);

  setTimeFirebase = () => {
    if (!this.state.listen) {
      const {
        uid, episodeId, episodeTitle, startDate,
      } = this.state;
      const currentDate = this.getDate();
      console.log(startDate);
      console.log(currentDate);
      const timeInterval = ((currentDate - startDate) / 60000).toFixed(2);
      // const distance = this.child.getState();
      if ((currentDate - this.state.lastLoggedDate) > 300000) {
        firebase.database().ref(`logs/${uid}/${episodeId}/`).push({
          timeStamp: this.state.currentTime,
          dateNow: currentDate,
          episodeTitle,
          distance: 0,
          timeInterval,
        }).then(() => this.setState({ lastLoggedDate: currentDate }));
      } else {
        firebase.database().ref(`logs/${uid}/${episodeId}/${this.state.logId}`).set({
          timeStamp: this.state.currentTime,
          dateNow: currentDate,
          episodeTitle,
          distance: 0,
          timeInterval,
        }).then(() => this.setState({ lastLoggedDate: currentDate }));
      }
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
    firebase.database().ref(`logs/${uid}/${episodeId}/`).on(
      'value', (snapshot) => {
        if (snapshot.val() === null) {
          firebase.database().ref(`logs/${uid}/${episodeId}/`).push({
            timeStamp: 0.0,
            dateNow: new Date().getTime(),
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
      const { length } = value;
      if (this.state.currentTime > length) {
        firebase.database().ref(`exercises/${value.uid}`).on('value', (snapshot) => {
          const { image, title } = snapshot.val();
          this.setState({
            playingExercise: {
              value: { image, title, exerciseId: value.uid },
            },
          });
        });
        this.state.previousStartTime.push(length);
      }
    });
  }

  navigateToPreviousExercise = () => {
    const { previousStartTime } = this.state;
    console.log(previousStartTime);
    const startTime = previousStartTime[previousStartTime.length - 2];
    this.setState({ currentTime: startTime });
    this.player.seek(startTime, 10);
    this.state.previousStartTime.pop(); // removes last item of array
  }

  renderLandscapeView = () => {
    const { image, title } = this.state.playingExercise.value;
    return (
      <View style={{ flex: 1, flexDirection: 'row' }}>
        {
          Platform.OS === 'android'
            ? <AndroidTrack ref={c => this.child = c} />
            : <IosTrack ref={c => this.child = c} />
        }
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
    );
  }

  renderPortraitView = () => {
    const { image, title } = this.state.playingExercise.value;
    return (
      <View>
        {
          Platform.OS === 'android'
            ? <AndroidTrack ref={c => this.child = c} />
            : <IosTrack ref={c => this.child = c} />
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
