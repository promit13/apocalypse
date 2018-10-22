import React, { Component } from 'react';
import {
  View, ScrollView,
} from 'react-native';
import Video from 'react-native-video';
import Controls from '../common/Controls';
import TrackDetails from '../common/TrackDetails';
import Loading from '../common/Loading';
import LoadScreen from '../common/LoadScreen';

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
    title: 'Trailer Player',
  };

  state = {
    title: '',
    URL: '',
    paused: false,
    loading: true,
    loadScreen: true,
  }

  componentDidMount() {
    const { title, URL } = this.props.navigation.state.params;
    this.setState({ title, URL, loadScreen: false });
  }

  onLoad = () => this.setState({ loading: false });

  onEnd = () => {
    this.setState({ paused: true });
  }

  render() {
    const { URL, title, loading, loadScreen } = this.state;
    return (
      <ScrollView style={styles.container}>
        <View style={styles.containerInner}>
          { loadScreen
            ? <LoadScreen />
            : (
              <View>
                <Video
                  source={{
                    uri: URL,
                  }}
                  ref={(c) => { this.video = c; }}
                  paused={this.state.paused}
                  onLoad={this.onLoad}
                  onEnd={this.onEnd}
                  resizeMode="cover"
                  playInBackground={false}
                  style={styles.backgroundVideo}
                />
                <TrackDetails
                  title={title}
                />
                {
                  loading
                    ? <Loading />
                    : (
                      <Controls
                        onPressPlay={() => this.setState({ paused: false })}
                        onPressPause={() => this.setState({ paused: true })}
                        paused={this.state.paused}
                        exercisePlayer
                      />
                    )
                }
              </View>
            )
          }
        </View>
      </ScrollView>
    );
  }
}
