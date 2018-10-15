import React, { Component } from 'react';
import {
  AppState, View, ScrollView, Text,
} from 'react-native';
import RNFetchBlob from 'react-native-fetch-blob';
import Video from 'react-native-video';
import AlbumArt from '../common/AlbumArt';
import Controls from '../common/Controls';
import Seekbar from '../common/Seekbar';
import Loading from '../common/Loading';
import LoadScreen from '../LoadScreen';
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
};
const albumImage = 'https://firebasestorage.googleapis.com/v0/b/astraining-95c0a.appspot.com/o/talon%2Ftalondark.png?alt=media&token=fdaf448b-dc43-4a72-a9e3-470aa68d9390';
// const albumImage = require('../../img/talon.png');

export default class DownloadPlayer extends Component {
  static navigationOptions = {
    title: 'Download Player',
    // header: null,
  };

  state = {
    loading: true,
    loadScreen: true,
    paused: true,
    totalLength: 1,
    currentTime: 0.0,
    playingExercise: '',
    listen: false,
    windowsHeight: 0,
    windowsWidth: 0,
    episodeTitle: '',
    videoUrl: '',
    previousStartTime: [],
    advance: false,
  };

  componentDidMount() {
    // const { file } = this.props.navigation.state.params;
    const { dirs } = RNFetchBlob.fs;
    const {
      check, title, advance,
    } = this.props.navigation.state.params;
    const formattedFileName = title.replace(/ /g, '_');
    this.setState({
      videoUrl: `${dirs.DocumentDir}/AST/episodes/${formattedFileName}.mp4`,
      listen: check,
      episodeTitle: title,
      advance,
      playingExercise: { value: { image: albumImage, title: '' } },
      loadScreen: false,
    });
  }

  onExercisePress = () => {
    const { title } = this.state.playingExercise.value;
    this.props.navigation.navigate('ExercisePlayer', { offline: true, exerciseTitle: title, advance: this.state.advance });
    this.setState({ paused: true });
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

  detectOrientation = (track) => {
    if (this.state.windowsHeight > this.state.windowsWidth) {
      return this.renderPortraitView(track);
    }
    return this.renderLandscapeView(track);
  };

  changeExercises = () => {
    const { exerciseLengthList, exercises } = this.props.navigation.state.params;
    exerciseLengthList.map((value, i) => {
      // const exercise = value[0];
      // const { length } = value;
      if (this.state.currentTime > value) {
        const exercise = exercises[i];
        this.setState({
          playingExercise: {
            value: { image: exercise[0].title, title: exercise[0].title },
          },
        });
        this.state.previousStartTime.push(value);
      }
    });
  }

  sliderReleased = (currentTime) => {
    this.setState({ paused: false, currentTime });
    this.player.seek(currentTime, 10);
  }

  navigateToPreviousExercise = () => {
    const { previousStartTime } = this.state;
    const startTime = previousStartTime[previousStartTime.length - 2];
    this.setState({ currentTime: startTime });
    this.player.seek(startTime, 10);
    this.state.previousStartTime.pop(); // removes last item of array
  }

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
            currentExercise={title}
            onPress={this.onExercisePress}
            showInfo
            offline
            advance={this.state.advance}
          />
        </View>
        <View style={{ flex: 1, justifyContent: 'space-between' }}>
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
                  : null
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
            offline
            advance={this.state.advance}
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
                    sliderReleased={this.sliderReleased}
                    seekValue={this.state.currentTime && this.state.currentTime}
                  />
                )
                : null
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
                navigateToPreviousExercise={this.navigateToPreviousExercise}
                paused={this.state.paused}
                renderForwardButton={this.state.listen}
              />
            </View>
          )
        }
      </View>
    );
  }

  render() {
    const { videoUrl, loadScreen } = this.state;
    if (loadScreen) return <LoadScreen />;
    const video = (
      <Video
        source={{ uri: videoUrl }} // Can be a URL or a local file.
        ref={(ref) => {
          this.player = ref;
        }}
        progressUpdateInterval={100.0}
        paused={this.state.paused} // Pauses playback entirely.
        resizeMode="cover" // Fill the whole screen at aspect ratio.
        playInBackground // ={true}
        onLoad={this.onLoad}
        onProgress={this.onProgress}
        onEnd={this.onEnd}
        ignoreSilentSwitch="ignore"
        style={styles.audioElement}
        allowsExternalPlayback
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
