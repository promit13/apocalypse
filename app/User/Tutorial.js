import React from 'react';
import { Image, View, ScrollView, Dimensions } from 'react-native';
import { Text, Button } from 'react-native-elements';
import { moderateScale } from 'react-native-size-matters';
import Video from 'react-native-video';
import Swiper from 'react-native-swiper';
import firebase from '../config/firebase';
import ShowModal from '../common/ShowModal';

const { width } = Dimensions.get('window');
const imageSize = width - 90;

const styles = {
  containerStyle: {
    flex: 1,
    backgroundColor: '#001331',
    paddingBottom: moderateScale(10),
    paddingTop: moderateScale(30),
    justifyContent: 'center',
  },
  swiperContainer: {
    flex: 1,
    alignItems: 'center',
  },
  textStyle: {
    marginTop: moderateScale(20),
    color: 'white',
    textAlign: 'center',
    fontSize: moderateScale(14),
  },
  imageStyle: {
    height: moderateScale(imageSize, -0.2),
    width: moderateScale(imageSize, -0.2),
  },
  slideStyle: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonStyle: {
    backgroundColor: '#001331',
    borderColor: '#f5cb23',
    borderRadius: moderateScale(20),
    marginTop: moderateScale(15),
    borderWidth: moderateScale(2),
  },
};

export default class Tutorial extends React.Component {
  static navigationOptions = {
    title: 'Tutorial',
  };

  state = {
    tutorials: {},
    showButton: false,
    showModal: false,
    paused: true,
    loading: true,
  }

  componentDidMount() {
    const showButton = this.props.navigation.state.params === undefined ? true : false;
    firebase.database().ref('tutorials').on('value', (snapshot) => {
      // this.setState({ tutorials: snapshot.val(), loading: false, showButton });
      const tutorials = Object.values(snapshot.val());
      const sortedTutorialArray = tutorials.sort((a, b) => parseInt(a.position, 10) - parseInt(b.position, 10));
      this.setState({ tutorials: sortedTutorialArray, showButton });
      console.log(this.state.tutorials);
    });
  }

  onPressPause = () => {
    this.setState({ paused: true });
  }

  onLoad = (data) => {
    this.setState({ loading: false });
  };

  onEnd = () => {
    this.setState({ paused: true });
    this.player.seek(0);
  }

  onPressPlay = () => {
    this.setState({ paused: false });
  }

  render() {
    const { showButton, showModal, tutorials, paused, loading } = this.state;
    const { netInfo } = this.props.screenProps;
    const { length } = Object.keys(tutorials);
    const tutorialsList = Object.entries(tutorials).map(([key, value], i) => {
      return (
        <ScrollView key={key}>
          <View style={styles.slideStyle} key={key}>
            <Image resizeMode="contain" style={styles.imageStyle} source={{ uri: value.file }} />
            <Text style={styles.textStyle}>
              {value.description}
            </Text>
          </View>
          {
              i === (length - 1) && !loading
                ? (
                  <View>
                    <Button
                      buttonStyle={[styles.buttonStyle, { backgroundColor: '#f5cb23' }]}
                      fontSize={moderateScale(16)}
                      color="#001331"
                      title={paused ? 'PLAY TRAILER ' : 'PAUSE TRAILER'}
                      onPress={() => {
                        paused ? this.onPressPlay() : this.onPressPause()
                      }}
                    />
                    {
                      showButton
                      && (<Button
                        buttonStyle={styles.buttonStyle}
                        fontSize={moderateScale(12)}
                        color="#f5cb23"
                        title="TAKE ME IN"
                        onPress={() => {
                          if (!netInfo) {
                            return this.setState({ showModal: true });
                          }
                          firebase.database().ref(`users/${this.props.screenProps.user.uid}`).update({
                            tutorial: true,
                          });
                        }}
                      />
                      )
                    }
                  </View>
                )
                : null
            }
        </ScrollView>
      );
    });
    return (
      <View style={styles.containerStyle}>
        <Swiper
          loop={false}
          // showsButtons // shows side arrows
          dotColor="#696238"
          activeDotColor="#f5cb23"
        >
          {tutorialsList}
        </Swiper>
        <ShowModal
          visible={showModal}
          title="Please check your internet connection"
          buttonText="OK"
          onPress={() => {
            this.setState({ showModal: false });
          }}
        />
        <Video
          source={{ uri: 'https://firebasestorage.googleapis.com/v0/b/astraining-95c0a.appspot.com/o/trailers%2F-LP5Jim23GTDagRtsj4_%2FAST%20December%20Audio%20Trailer.mp3.mp3?alt=media&token=37f8bd46-5d16-4c60-acc7-e35f25dc46f8' }} // Can be a URL or a local file.
          ref={(ref) => {
            this.player = ref;
          }}
          progressUpdateInterval={100.0}
          paused={this.state.paused} // Pauses playback entirely.
          ignoreSilentSwitch="ignore"
          onLoad={this.onLoad}
          onProgress={this.onProgress}
          onEnd={this.onEnd}
          // repeat // ios only
          style={styles.audioElement}
        />
      </View>
    );
  }
}
