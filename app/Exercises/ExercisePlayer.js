import React, { Component } from 'react';
import {
  View, ScrollView,
} from 'react-native';
import RNFetchBlob from 'react-native-fetch-blob';
import Video from 'react-native-video';
import Controls from '../common/Controls';
import TrackDetails from '../common/TrackDetails';
import Loading from '../common/Loading';
import firebase from '../config/firebase';

const styles = {
  backgroundVideo: {
    position: 'relative',
    top: 0,
    height: 200,
    left: 0,
    bottom: 0,
    right: 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#001331',
  },
  containerInner: {
    marginTop: 90,
  },
  text: {
    color: 'white',
  },
  audioElement: {
    height: 0,
    width: 0,
  },
  modal: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  button: {
    backgroundColor: '#fff',
    borderRadius: 5,
    marginTop: 10,
  },
};


export default class ExercisePlayer extends Component {
  static navigationOptions = {
    title: 'Exercise Player',
  };

  state = {
    title: '',
    video: '',
    paused: false,
    loading: true,
  }

  componentDidMount() {
    const { dirs } = RNFetchBlob.fs;
    const { exerciseId, offline, exerciseTitle } = this.props.navigation.state.params;
    console.log(exerciseId);
    if (offline) {
      return this.setState({ video: `${dirs.MovieDir}/AST/exercises/${exerciseTitle}.mp4`, title: exerciseTitle });
    }
    firebase.database().ref(`exercises/${exerciseId}`).on('value', (snapshot) => {
      const { video, title } = snapshot.val();
      this.setState({ video, title });
    });
  }

  onLoad = () => this.setState({ loading: false });

  onEnd = () => {
    this.setState({ paused: true });
  }

  render() {
    const { video, title } = this.state;
    return (
      <ScrollView style={styles.container}>
        <View style={styles.containerInner}>
          <Video
            source={{
              uri: video,
            }}
            ref={(c) => { this.video = c; }}
            paused={this.state.paused}
            onLoad={this.onLoad}
            onEnd={this.onEnd}
            resizeMode="cover"
            playInBackground={false}
            style={styles.backgroundVideo}
          />
          { this.state.loading
            ? <Loading />
            : (
              <View>
                <TrackDetails
                  title={title}
                />
                <Controls
                  onPressPlay={() => this.setState({ paused: false })}
                  onPressPause={() => this.setState({ paused: true })}
                  paused={this.state.paused}
                  exercisePlayer
                />
              </View>
            )
          }
        </View>
      </ScrollView>
    );
  }
}
