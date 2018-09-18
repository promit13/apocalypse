import React, { Component } from 'react';
import {
  AppState, View, ScrollView, Text,
} from 'react-native';
import Realm from 'realm';
import RNFetchBlob from 'react-native-fetch-blob';
import Video from 'react-native-video';
import firebase from '../config/firebase';
import AlbumArt from '../common/AlbumArt';
import Controls from '../common/Controls';
import Seekbar from '../common/Seekbar';
import Loading from '../common/Loading';
import FormatTime from '../common/FormatTime';
import realm from '../config/Database';

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
const albumImage = 'https://firebasestorage.googleapis.com/v0/b/astraining-95c0a.appspot.com/o/temp%2Ftalon.png?alt=media&token=8e8e51e4-e270-408d-a57d-b08c96eb98a9';

export default class DownloadPlayer extends Component {
  static navigationOptions = {
    title: 'Download Player',
    // header: null,
  };

  state = {
    loading: true,
    paused: true,
    totalLength: 1,
    currentTime: 0.0,
    playingExercise: '',
    windowsHeight: 0,
    windowsWidth: 0,
    episodeTitle: '',
    videoUrl: '',
  };

  componentWillMount() {
    const { file } = this.props.navigation.state.params;
    this.setState({ episodeTitle: file, playingExercise: { value: { image: albumImage, title: '' } } });
  }

  componentDidMount() {
    const { dirs } = RNFetchBlob.fs;
    const { episodeTitle } = this.state;
    this.setState({ videoUrl: `${dirs.MovieDir}/AST/${episodeTitle}.mp4` });

    // const episodeDetail = Array.from(realm.objects('SavedEpisodes'));

    const episodeDetail = Array.from(realm.objects('SavedEpisodes').filtered(`id = "${episodeTitle}"`));
    // const episodeDetail = realm.objects('SavedEpisodes').filtered(`'id = ${episodeTitle}`);;
    console.log(episodeDetail);
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

//   onExercisePress = () => {
//     this.props.navigation.navigate('ExercisePlayer', { exercise: this.state.playingExercise });
//     this.setState({ paused: true });
//     firebase.database().ref('videos/example').set({
//       timeStamp: this.state.currentTime,
//     });
//   }

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
    this.setState({ currentTime });
    this.player.seek(currentTime, 10);
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
            onPress={() => {}}
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
        <View style={styles.albumView}>
          <AlbumArt
            url={
             this.state.playingExercise
               ? image
               : null
            }
            currentExercise={title}
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
                seekValue={this.state.currentTime && this.state.currentTime}
              />
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
                renderForwardButton
              />
            </View>
          )
        }
      </View>
    );
  }

  render() {
    const { videoUrl } = this.state;
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
