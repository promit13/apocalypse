import React, { Component } from 'react';
import {
  ActivityIndicator, AppState, View, ScrollView, Modal,
} from 'react-native';
import { Text, Button } from 'react-native-elements';
import Video from 'react-native-video';
import firebase from '../config/firebase';
import AlbumArt from '../common/AlbumArt';
import TrackDetails from '../common/TrackDetails';
import Controls from '../common/Controls';
import Seekbar from '../common/Seekbar';

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
    padding: 10,
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
      selectedTrack: 0,
      playingExercise: '',
      listen: false,
      windowsHeight: 0,
      windowsWidth: 0,
      showDialog: false,
      episodeId: '',
      uid: '',
      logId: '',
      lastLoggedDate: null,
      previousStartTime: [],
    };

    componentWillMount() {
      const {
        check, episodeId, index,
      } = this.props.navigation.state.params;
      this.setState({
        listen: check,
        episodeId,
        uid: this.props.screenProps.user.uid,
        selectedTrack: index,
      });
    }

    componentDidMount() {  
      Object.entries(this.props.navigation.state.params.exercises)
        .map(([exercise, value], i) => {
          i === 0
            ? this.setState({
              playingExercise: { name: exercise, value }
            })
            : null;
        });
      // this.getTimeFirebase() !== 0
      //   ? this.setState({ currentTime: this.getTimeFirebase() })
      //   : null;
      this.getTimeFirebase();
    }

    componentDidUpdate(prevProps, prevState) {
      if (prevState.currentTime > 0) {
        this.changeExercises;
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
    this.setTimeFirebase();
    this.changeExercises();
  }

  onExercisePress = () => {
    const { videoUrl, title } = this.state.playingExercise.value;
    this.props.navigation.navigate('ExercisePlayer', { videoUrl, title });
    this.setState({ paused: true });
    this.setTimeFirebase();
  }

  onAppStateChange = (nextAppState) => {
    if (nextAppState === 'background') {
    }
  }

  onProgress = (data) => {
    this.setState({ currentTime: data.currentTime });
    this.changeExercises();
    AppState.addEventListener('change', (state) => {
      if (state === 'background') {
      // this.setTimeFirebase();
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
        console.log(snapshot.val());
        if (snapshot.val() === null) {
          return this.setState({ currentTime: this.getCurrentTimeInMs(0.0) });
        }
        this.setState({
          currentTime: this.getCurrentTimeInMs(snapshot.val().timeStamp),
          lastLoggedDate: snapshot.val().dateNow,
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
    this.setState({ showDialog: true });
    this.setTimeFirebase();
  }

  onDragSeekBar = (currentTime) => {
    this.player.seek(currentTime, 10);
  }

  onPressPlay = () => {
    this.setState({ paused: false });
  }

  setTime = (data) => {
    this.setState({ currentPosition: Math.floor(data.currentTime) });
  }

  getCurrentTimeInMs = time => parseInt(time, 10);

  setTimeFirebase = () => {
    if (!this.state.listen) {
      const { uid, episodeId } = this.state;
      const currentDate = new Date().getTime();
      if ((currentDate - this.state.lastLoggedDate) > 300000) {
        firebase.database().ref(`logs/${uid}/${episodeId}/`).push({
          timeStamp: this.state.currentTime,
          dateNow: new Date().getTime(),
        });
      } else {
        firebase.database().ref(`logs/${uid}/${episodeId}/${this.state.logId}`).set({
          timeStamp: this.state.currentTime,
          dateNow: currentDate,
        });
      }
    }
  }

  getlastLogId = (snapshot) => {
    const array = Object.keys(snapshot);
    const id = array[array.length - 1];
    console.log(id);
    this.setState({ logId: id });
  }

  getTimeFirebase = async () => {
    const { uid, episodeId } = this.state;
    firebase.database().ref(`logs/${uid}/${episodeId}/`).on(
      'value', (snapshot) => {
        if (snapshot.val() == null) {
          firebase.database().ref(`logs/${uid}/${episodeId}/`).push({
            timeStamp: 0.0,
            dateNow: new Date().getTime(),
          }).then(() => {
            firebase.database().ref(`logs/${uid}/${episodeId}/`).on(
              'value', (snap) => {
                this.getlastLogId(snap.val());
              },
            );
          });
        } else {
          this.getlastLogId(snapshot.val());
        }
      }, (error) => {
        console.log(error);
      },
    );
  }

  showModal = () => {
    if (this.state.showDialog) {
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
                  this.props.navigation.navigate('TalonScreen');
                }}
              />
            </View>
          </View>
        </Modal>
      );
    }
  }

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

  changeExercises = () => {
    Object.entries(this.props.navigation.state.params.exercises)
      .map(([key, value], i) => {
        const { title, start } = value;
        if (this.state.currentTime > start) {
          this.setState({
            playingExercise: {
              name: title,
              value,
            },
          });
          this.state.previousStartTime.push(start);
        }
      });
  }

  navigateToPreviousExercise = () => {
    const { previousStartTime } = this.state;
    const startTime = previousStartTime[previousStartTime.length - 2];
    this.setState({ currentTime: startTime });
    this.player.seek(startTime, 10);
    this.state.previousStartTime.pop(); // removes last item of array
  }

  renderLandscapeView = (track) => {
    return (
      <View style={{ flex: 2, flexDirection: 'row' }}>
        <View style={{
          height: '100%', flex: 1, backgroundColor: '#33425a', padding: 20,
        }}
        >
          <AlbumArt
            url={
             this.state.playingExercise
               ? this.state.playingExercise.value.imageUrl
               : track.workoutImage
            }
            currentExercise={this.state.playingExercise.name}
            onPress={this.onExercisePress}
            showInfo
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
            navigateToPreviousExercise={this.navigateToPreviousExercise}
            renderForwardButton={this.state.listen}
          />
          { this.state.loading
            ? <ActivityIndicator size="large" color="white" style={styles.loading} />
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
    return (
      <View>
        <View style={styles.albumView}>
          <AlbumArt
            url={
             this.state.playingExercise
               ? this.state.playingExercise.value.imageUrl
               : track.workoutImage
            }
            currentExercise={this.state.playingExercise.name}
            onPress={this.onExercisePress}
            showInfo
          />
        </View>
        <View style={styles.line} />
        { this.state.loading
          ? <ActivityIndicator size="large" color="white" style={styles.loading} />
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
    const track = this.props.navigation.state.params.tracks[this.state.selectedTrack];
    const video = (
      <Video
        source={{ uri: track.audioUrl }} // Can be a URL or a local file.
        ref={(ref) => {
          this.player = ref;
        }}
        progressUpdateInterval={50.0}
        paused={this.state.paused} // Pauses playback entirely.
        resizeMode="cover" // Fill the whole screen at aspect ratio.
        playInBackground // ={true}
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
        {this.detectOrientation(track)}
        {video}
      </ScrollView>
    );
  }
}
