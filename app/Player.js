import React, { Component } from 'react';
import {
  View,
  Text,
  StatusBar,
} from 'react-native';
import RNFS from 'react-native-fs';

import Header from './Header';
import AlbumArt from './AlbumArt';
import TrackDetails from './TrackDetails';
import Controls from './Controls';
import Video from 'react-native-video';


export default class Player extends Component {
  
  constructor(props) {
    super(props);
    this.state = {
      paused: true,
      totalLength: 1,
      currentPosition: 0,
      selectedTrack: 0,
      repeatOn: false,
      shuffleOn: false,
      playingGifUrl: '',
    };
  }
  componentDidMount() {
    console.log(this.props);
    this.setState({
      playingGifUrl: this.props.gifs.exercise1.url
    }, function() {
      console.log( this.state.playingGifUrl);      
    });

  }
  setDuration(data) {
    // console.log(totalLength);
    this.setState({totalLength: Math.floor(data.duration)});
  }

  setTime(data) {
    //console.log(data);
    this.setState({currentPosition: Math.floor(data.currentTime)});
  }

  seek(time) {
    time = Math.round(time);
    this.refs.audioElement && this.refs.audioElement.seek(time);
    this.setState({
      currentPosition: time,
      paused: false,
    });
  }

  onBack() {
    if (this.state.currentPosition < 10 && this.state.selectedTrack > 0) {
      this.refs.audioElement && this.refs.audioElement.seek(0);
      this.setState({ isChanging: true });
      setTimeout(() => this.setState({
        currentPosition: this.state.currentPosition - 15,
        paused: false,
        totalLength: 1,
        isChanging: false,
        selectedTrack: this.state.selectedTrack - 1,
      }), 0);
    } else {
      this.refs.audioElement.seek(0);
      this.setState({
        currentPosition: 0,
      });
    }
  }

  onProgress(data) {
    console.log(data);

  }
  onDownload() {
    console.log(this.props.tracks[0].audioUrl);
    RNFS.downloadFile({fromUrl:this.props.tracks[0].audioUrl, toFile: 'cache'}).promise.then(res => {
      console.log('done');
      console.log(res);
    });
  }
  render() {
    

    const track = this.props.tracks[this.state.selectedTrack];
    const video =  (
      <Video source={{uri: track.audioUrl}} // Can be a URL or a local file.
        ref="audioElement"
        paused={this.state.paused}               // Pauses playback entirely.
        resizeMode="cover"           // Fill the whole screen at aspect ratio.
        playInBackground={true}
        style={styles.audioElement} />
    );

    return (
      <View style={styles.container}>
        <View style={styles.containerInner} >
          
          <AlbumArt url={this.state.playingGifUrl} />
          <TrackDetails title={track.title} artist={track.artist} />

          <Controls
            onPressPlay={() => this.setState({paused: false})}
            onPressPause={() => this.setState({paused: true})}
            onBack={this.onBack.bind(this)}
            onProgress={this.onProgress}
            onDownload={this.onDownload.bind(this)}
            paused={this.state.paused}
          />
          {video}
          
        </View>
      </View>
    );
  }
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: 'rgb(4,4,4)',
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
  }
};
