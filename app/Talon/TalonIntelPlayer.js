import React, { Component } from 'react';
import {
  AppState, View, ScrollView,
} from 'react-native';
import { Text } from 'react-native-elements';
import Video from 'react-native-video';
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
  },
  containerInner: {
    marginTop: 30,
  },
  textTitle: {
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
const albumImage = 'https://firebasestorage.googleapis.com/v0/b/astraining-95c0a.appspot.com/o/talon%2Ftalondark.png?alt=media&token=fdaf448b-dc43-4a72-a9e3-470aa68d9390';

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
    const {
      episodeId, talon, exerciseTitle, video, image, offline, advance, exercise,
    } = this.props.navigation.state.params;
    if (talon) {
      firebase.database().ref(`episodes/${episodeId}`).on('value', (snapshot) => {
        const { title, intel } = snapshot.val();
        this.setState({
          episodeTitle: title,
          videoUrl: intel,
          playingExercise: { value: { image: albumImage, title: '' } },
          loadScreen: false,
        });
      });
    } else if (offline) {
      const formattedExerciseName = image.replace(/\s+/g, '');
      const { dirs } = RNFetchBlob.fs;
      if (advance) {
        this.setState({
          videoUrl: `${dirs.DocumentDir}/AST/advanceExercises/${formattedExerciseName}.mp4`,
          episodeTitle: exerciseTitle,
          playingExercise: { value: { image: `${dirs.DocumentDir}/AST/advanceImages/${formattedExerciseName}.png`, title: '' } },
          loadScreen: false,
          exercise,
        });
      } else {
        this.setState({
          videoUrl: `${dirs.DocumentDir}/AST/introExercises/${formattedExerciseName}.mp4`,
          episodeTitle: exerciseTitle,
          playingExercise: { value: { image: `${dirs.DocumentDir}/AST/introImages/${formattedExerciseName}.png`, title: '' } },
          loadScreen: false,
          exercise,
        });
      }
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
    this.setState({ paused: true, currentTime: 0.0 });
    this.player.seek(0, 10);
  }

  onDragSeekBar = (currentTime) => {
    this.setState({ paused: true });
  }

  onPressPlay = () => {
    this.setState({ paused: false });
  }

  getCurrentTimeInMs = time => parseInt(time, 10);

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
    const { image, title } = this.state.playingExercise.value;
    return (
      <View style={{ flex: 2, flexDirection: 'row' }}>
        <View style={{ flex: 1, backgroundColor: '#33425a', padding: 20 }}>
          <AlbumArt
            url={
             this.state.playingExercise
               ? image
               : null
            }
            talonPlayer
            onPress={() => {}}
          />
        </View>
        <View style={{ flex: 1, justifyContent: 'space-between' }}>
          <Text h4 style={styles.textTitle}>
            {this.state.episodeTitle}
          </Text>
          {
            this.state.exercise
              ? (
                <Controls
                  onPressPlay={this.onPressPlay}
                  onPressPause={this.onPressPause}
                  paused={this.state.paused}
                  exercisePlayer
                />
              )
              : (
                <Controls
                  onPressPlay={this.onPressPlay}
                  onPressPause={this.onPressPause}
                  onBack={this.onBack}
                  onForward={this.onForward}
                  onDownload={this.onDownload}
                  paused={this.state.paused}
                  renderForwardButton
                />
              )
          }
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
        <View style={styles.line} />
        <View style={styles.albumView}>
          <AlbumArt
            url={
             this.state.playingExercise
               ? image
               : null
            }
            talonPlayer
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
                sliderReleased={this.sliderReleased}
                seekValue={this.state.currentTime && this.state.currentTime}
              />
              <FormatTime
                currentTime={this.state.currentTime}
                remainingTime={this.state.totalLength - this.state.currentTime}
              />
              <Text h4 style={styles.textTitle}>
                {this.state.episodeTitle}
              </Text>
              {
            this.state.exercise
              ? (
                <Controls
                  onPressPlay={this.onPressPlay}
                  onPressPause={this.onPressPause}
                  paused={this.state.paused}
                  exercisePlayer
                />
              )
              : (
                <Controls
                  onPressPlay={this.onPressPlay}
                  onPressPause={this.onPressPause}
                  onBack={this.onBack}
                  onForward={this.onForward}
                  onDownload={this.onDownload}
                  paused={this.state.paused}
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
