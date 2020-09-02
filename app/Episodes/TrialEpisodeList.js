import React from 'react';
import {
  ScrollView, View, Image, TouchableOpacity, Platform,
  StatusBar, PermissionsAndroid, AsyncStorage,
  Modal, TouchableHighlight,
} from 'react-native';
import {
  Text, ListItem, Icon, Button,
} from 'react-native-elements';
import GoogleFit from 'react-native-google-fit';
import * as RNIap from 'react-native-iap';
import { connect } from 'react-redux';
import Permissions from 'react-native-permissions';
import Orientation from 'react-native-orientation';
import { scale, moderateScale } from 'react-native-size-matters';
import DeviceInfo from 'react-native-device-info';
import * as Progress from 'react-native-progress';
import realm from '../config/Database';
import ShowModal from '../common/ShowModal';
import firebase from '../config/firebase';
import LoadScreen from '../common/LoadScreen';
import Loading from '../common/Loading';
import OfflineMsg from '../common/OfflineMsg';
import {
  downloadEpisode, deleteEpisodeList, stopDownload, stopIOSDownload,
} from '../actions/download';

const homeCover = require('../../img/homecover.jpg');
const speedImage = require('../../img/speed.png');
const strengthImage = require('../../img/strength.png');
const controlImage = require('../../img/control.png');

const styles = {
  mainContainer: {
    flex: 1,
    backgroundColor: '#001331',
  },
  imageStyle: {
    width: '100%',
    height: scale(250),
  },
  textStyle: {
    color: 'white',
    fontSize: moderateScale(18),
  },
  purchaseButtonStyle: {
    alignItems: 'flex-end',
    backgroundColor: '#001331',
    borderRadius: 5,
  },
  episodeHeaderView: {
    padding: moderateScale(15),
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#001331',
  },
  playingEpisodeView: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: moderateScale(10),
  },
  circularImageView: {
    height: moderateScale(60),
    width: moderateScale(60),
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 60 / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalView: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  modalInnerView: {
    backgroundColor: '#f2f2f2',
    alignItems: 'center',
    padding: moderateScale(10),
  },
  iconContainerView: {
    height: moderateScale(40),
    width: moderateScale(50),
    justifyContent: 'center',
  },
};

let seriesBought = false;
export default class TrialEpisodeList extends React.Component {
  static navigationOptions = {
    header: null,
  };

  state = {
    index: 0,
    deviceId: '',
    series: '',
    episodeWatchedCount: {},
    completeEpisodes: '',
    completeExercises: '',
    loading: true,
    modalText: '',
    showModal: false,
    modalDescription: '',
    buttonText: '',
    secondButtonText: '',
    askAdvance: false,
    playEpisode: false,
    showLoading: false,
    platform: '',
    episodePrice: '',
    seriesPrice: '',
  }

  componentDidMount= () => {
    Orientation.lockToPortrait();
    const deviceId = DeviceInfo.getUniqueID();
    console.log('DEVICE ID', deviceId);
    const platform = Platform.OS;
    try {
      this.requestPermissions(platform);
        firebase.database().ref(`episodeWatchedCount/${deviceId}`).on('value', (snapWatchCount) => {
          firebase.database().ref('series').on('value', (snapshot) => {
            firebase.database().ref('episodes').on('value', (snapEpisode) => {
              firebase.database().ref('exercises').on('value', async (snapExercises) => {
                const completeEpisodes = snapEpisode.val();
                const completeExercises = snapExercises.val();
                const episodeWatchedCount = snapWatchCount.val();
                const series = Object.values(snapshot.val());
                const seriesPurchaseId = platform === 'android'
                  ? (
                    series[0].googleID
                  )
                  : (
                    series[0].iosID
                  )
                const episodePurchaseId = platform === 'android'
                        ? Object.values(completeEpisodes)[0].googleID
                        : Object.values(completeEpisodes)[0].iosID
                 await RNIap.clearProducts();
                 const product = await RNIap.getProducts([episodePurchaseId, seriesPurchaseId]);
                 await RNIap.clearProducts();
                 const episodePrice = product[0].localizedPrice;
                 const seriesPrice = product[1].localizedPrice;
                console.log(episodePurchaseId, seriesPurchaseId);
                this.setState({
                  series: snapshot.val(),
                  episodeWatchedCount,
                  loading: false,
                  completeEpisodes,
                  completeExercises,
                  deviceId,
                  platform,
                  episodePrice,
                  seriesPrice,
                });
                AsyncStorage.setItem('series', JSON.stringify({
                  episodeWatchedCount,
                  series: snapshot.val(),
                  completeEpisodes,
                  episodePrice,
                  seriesPrice,
                }));
                // });
              });
            });
          });
        })
    } catch (err) {
      console.warn(err.code, err.message);
    }
  }

  // componentDidUpdate(prevProps, prevState) {
  //   if ((this.props.downloadProgress >= prevState.downloadPercentage) || (this.props.deleteStatus === this.state.deleteStatus)) {
  //     this.readDirectory();
  //   }
  // }

  componentWillUnmount() {
    RNIap.endConnection();
  }

  onEpisodeClick = (
    title,
    episodeId,
    category,
    description,
    exercises,
    completeExercises,
    video,
    startWT,
    endWT,
    totalTime,
    workoutTime,
    videoSize,
    episodeIndex,
    seriesKey,
    seriesIndex,
    deviceId,
    counter,
  ) => {
    this.props.navigation.navigate('EpisodeView', {
      episodeId,
      title,
      category,
      description,
      exercises,
      completeExercises,
      video,
      totalTime,
      workoutTime,
      videoSize,
      episodeIndex,
      seriesId: seriesKey,
      seriesIndex,
      startWT,
      endWT,
      completed: false,
      counter,
      deviceId,
      purchased: false,
      offline: false,
      episodeList: true,
      userDatas: null,
      seriesBought: false,
    });
    // });
  }

  getTitleAndId = (seriesIndex, episodeIndex, getImage) => {
    if (this.state.series === '') {
      return console.log('no series');
    }
    const seriesKey = (Object.keys(this.state.series))[seriesIndex];
    const { uid, title, category } = ((Object.values(((Object.values(this.state.series))[seriesIndex]).episodes))[episodeIndex]);
    if (getImage) {
      if (category === 'Speed') {
        return speedImage;
      }
      if (category === 'Strength') {
        return strengthImage;
      }
      if (category === 'Control') {
        return controlImage;
      }
    }
    return { uid, title, seriesKey };
  }

  getEpisodesListSize = (seriesIndex) => {
    if (this.state.series === '') {
      return console.log('no series');
    }
    const { length } = Object.keys(((Object.values(this.state.series))[seriesIndex]).episodes);
    console.log(length);
    return length;
  }

  getEpisodeCount = (id) => {
    const { episodeWatchedCount } = this.state;
    let counter = 0;
    if (episodeWatchedCount !== null) {
      counter = episodeWatchedCount[id] !== undefined ? episodeWatchedCount[id].count : 0;
      return counter;
    }
    return counter;
  }

  requestPermissions = async (platform) => {
    try {
      if (platform === 'android') {
        await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        ]);
        GoogleFit.isEnabled((error, isEnabled) => {
          console.log(isEnabled);
          if (!isEnabled) {
            GoogleFit.authorize((authError, result) => {
              if (authError) {
                console.log(`AUTH ERROR ${authError}`);
              }
              console.log(`AUTH SUCCESS ${result}`);
            });
          }
        });
      } else {
        await Permissions.check('notification').then((response) => {
          console.log(response);
          if (response !== 'authorized') {
            Permissions.request('notification', { type: ['alert', 'badge'] }).then(
              (res) => {
                console.log(res);
              },
            );
          }
        });
        await Permissions.check('motion').then((response) => {
          console.log(response);
          if (response !== 'authorized') {
            Permissions.request('motion').then(
              (res) => {
                console.log(res);
              },
            );
          }
        });
      }
    } catch (err) {
      console.log(err);
    }
  }

  onTrialEpisodePress = (
    title,
    uid,
    category,
    description,
    exercises,
    video,
    startWT,
    endWT,
    totalTime,
    workoutTime,
    videoSize,
    episodeIndex,
    seriesKey,
    seriesIndex,
    counter,
  ) => {
      return this.setState({
        showModal: true,
        modalText: 'Ready to Run?',
        modalDescription: `If you’re ready to work out, and would like to see your run log and unlock your Essential Intel at the end of the episode, please create an account or log in.\n\nYou can also listen and work out without an account.`,
        buttonText: 'Create Account',
        secondButtonText: 'Continue',
        askAdvance: 'true',
        playEpisode: true,
        downloadTitle: title,
        downloadUid: uid,
        downloadCategory: category,
        downloadDescription: description,
        downloadExercises: exercises,
        downloadVideo: video,
        downloadStartWT: startWT,
        downloadEndWT: endWT,
        downloadTotalTime: totalTime,
        downloadWorkoutTime: workoutTime,
        downloadVideoSize: videoSize,
        downloadEpisodeIndex: episodeIndex,
        downloadSeriesKey: seriesKey,
        downloadSeriesIndex: seriesIndex,
        downloadCounter: counter,
      });
    }

  renderList = () => {
    const {
      series, completeEpisodes,
      deviceId,
      episodeWatchedCount, completeExercises,
      episodePrice, seriesPrice,
    } = this.state;
    const { netInfo, connectionType } = this.props.screenProps;
    console.log(completeEpisodes);
    // const counterArray = [];
    console.log(connectionType);
    const seriesList = Object.entries(series).map(([seriesKey, value], seriesIndex) => {
      // minIndex = maxIndex + 1;
      const { episodes } = value;
      if (episodes === undefined) {
        return console.log('no episodes added');
      }
      // maxIndex += Object.keys(value.episodes).length; // value.episodes.length ;
      const seriesLength = Object.keys(episodes).length;
      const episodesList = Object.entries(episodes)
        .map(([episodeKey, episodeValue], episodeIndex) => {
          const { uid } = episodeValue;
          const {
            title, category, totalTime, workoutTime, videoSize, description, exercises, video, startWT, endWT,
          } = completeEpisodes[uid];
        const counter = episodeWatchedCount === null ? 0 : episodeWatchedCount[uid] === undefined ? 0 : episodeWatchedCount[uid].count;
          return (
            <ListItem
              key={episodeKey}
              leftIcon={{ name: 'circle', type: 'font-awesome', color: '#f5cb23', size: moderateScale(15) }}
              title={`${episodeIndex + 1}. ${title}`}
              subtitle={`${category} - ${videoSize} MB`}
              titleStyle={{ color: (episodeIndex > 0) || (seriesIndex > 0) || (counter >= 2) ? 'gray' : 'white', fontSize: moderateScale(18) }}
              subtitleStyle={{ color: (episodeIndex > 0) || (seriesIndex > 0) || (counter >= 2) ? 'gray' : 'white', fontSize: moderateScale(10) }}
              rightIcon={
                 (
                  <Button
                    title={(episodeIndex === 0) && (counter < 2) ? '  TRY  ' : `${episodePrice}`}
                    fontSize={moderateScale(12)}
                    buttonStyle={[styles.purchaseButtonStyle, { backgroundColor: 'green' }]}
                    onPress={() => {
                      if (!netInfo) {
                        return this.setState({
                          showModal: true,
                          modalText: 'Please check your internet connection',
                          modalDescription: '',
                          askAdvance: false,
                          buttonText: 'Ok',
                        });
                      }
                      if((episodeIndex === 0) && (counter < 2)) {
                        return this.onTrialEpisodePress(
                          title,
                          uid,
                          category,
                          description,
                          exercises,
                          video,
                          startWT,
                          endWT,
                          totalTime,
                          workoutTime,
                          videoSize,
                          episodeIndex,
                          seriesKey,
                          seriesIndex,
                          counter,
                        );
                      }
                      return this.setState({
                        showModal: true,
                        modalText: 'Action Required',
                        modalDescription: `To make purchases, download episodes, track episode progress through TALON, unlock Essential Intel and sync across multiple devices, please create an account.\n\nWe promise it’s painless, Risky!`,
                        buttonText: 'Create Account',
                        secondButtonText: 'Cacnel',
                        askAdvance: true,
                      });
                    }
                  }
                  />
                 )
                }
              containerStyle={{ backgroundColor: '#33425a' }}
              underlayColor="#2a3545"
              onPressRightIcon={() => {}}
              onPress={() => {
                console.log(counter);
                // const count = episodeWatchedCount[uid] === undefined ? 0 : episodeWatchedCount[uid].count;
                if (!netInfo) {
                  return this.setState({
                    showModal: true,
                    modalText: 'Please check your internet connection',
                    modalDescription: '',
                    askAdvance: false,
                    buttonText: 'Ok'
                  });
                }
                if ((episodeIndex > 0) || (seriesIndex > 0) || (counter >= 2)) {
                  return this.setState({
                    showModal: true,
                    modalText: 'Item not purchased',
                    modalDescription: '',
                    askAdvance: false,
                    buttonText: 'Ok',
                  });
                }
                this.onTrialEpisodePress(
                  title,
                  uid,
                  category,
                  description,
                  exercises,
                  video,
                  startWT,
                  endWT,
                  totalTime,
                  workoutTime,
                  videoSize,
                  episodeIndex,
                  seriesKey,
                  seriesIndex,
                  counter,
                );
              }}
            />
          );
        });
      return (
        <View>
          <View style={styles.episodeHeaderView}>
            <Text style={styles.textStyle}>
              {`Part ${seriesIndex + 1} (Episodes 01 - ${seriesLength})`}
            </Text>
            <View>
              {
                (
                    <Button
                      title={`    ${seriesPrice}    `}
                      fontSize={moderateScale(12)}
                      buttonStyle={[styles.purchaseButtonStyle, { backgroundColor: 'green' }]}
                      onPress={() => {
                        if (!netInfo) {
                          return this.setState({
                            showModal: true,
                            modalText: 'Please check your internet connection',
                            modalDescription: '',
                            askAdvance: false,
                            buttonText: 'Ok'
                          });
                        }
                        return this.setState({
                          showModal: true,
                          modalText: 'Action Required',
                          modalDescription: `To make purchases, download episodes, track episode progress through TALON, unlock Essential Intel and sync across multiple devices, please create an account.\n\nWe promise it’s painless, Risky!`,
                          buttonText: 'Create Account',
                          secondButtonText: 'Cacnel',
                          askAdvance: 'true',
                        });
                      }
                    }
                    />
                  )
              }
            </View>
          </View>
          <View style={{ height: 1, backgroundColor: 'gray' }} />
          {episodesList}
        </View>
      );
    });
    return (
      <View>
        {seriesList}
      </View>
    );
  }

  showModal = () => {
    return (
      <Modal transparent visible={this.state.showLoading}>
        <View style={styles.modalView}>
            <Loading />
        </View>
      </Modal>
    );
  }

  render() {
    const {
      completeEpisodes, loading, showModal, modalText, deviceId, completeExercises,
      modalDescription, buttonText, secondButtonText, askAdvance, playEpisode,
      downloadTitle, downloadUid, downloadCategory, downloadDescription,
      downloadExercises, downloadVideo, downloadStartWT, downloadEndWT,
      downloadTotalTime, downloadWorkoutTime, downloadVideoSize, downloadEpisodeIndex,
      downloadSeriesKey, downloadSeriesIndex, downloadCounter,
    } = this.state;
    const { netInfo } = this.props.screenProps;
    if (loading) return <LoadScreen text="Preparing your apocalypse" />;
    return (
      <View style={styles.mainContainer}>
        {/* <StatusBar hidden /> */}
        <StatusBar backgroundColor="#00000b" barStyle="light-content" />
        { !netInfo ? <OfflineMsg margin={18} showText /> : null }
        {/* <NavigationEvents
          onDidFocus={() => { downloadActive ? null : this.readDirectory(); }}
        /> */}
        <ScrollView>
          <View>
            <Image
              style={styles.imageStyle}
              resizeMode="stretch"
              resizeMethod="resize"
              source={homeCover}
            />
            <TouchableHighlight
              underlayColor="black"
              activeOpacity={0.6}
              onPress={() => {
                const id = this.getTitleAndId(0, 0).uid;
                const counter = this.getEpisodeCount(id);
                const seriesKey = this.getTitleAndId(0, 0).seriesKey
                if (!netInfo) {
                  return this.setState({
                    showModal: true,
                    modalText: 'Please check your internet connection',
                    modalDescription: '',
                    askAdvance: false,
                    buttonText: 'Ok'
                  });
                }
                if (counter === 2) {
                  return this.setState({
                    showModal: true,
                    modalText: 'Item not purchased',
                    modalDescription: '',
                    buttonText: 'Ok',
                    askAdvance: false,
                  });
                }
                const {
                  totalTime, workoutTime, videoSize, title, category, description, exercises, video, startWT, endWT,
                } = completeEpisodes[id];
                // if (!netInfo && !downloaded) {
                //   return this.setState({ showModal: true, modalText: 'Please check your internet connection' });
                // }
                this.onTrialEpisodePress(
                  title,
                  id,
                  category,
                  description,
                  exercises,
                  video,
                  startWT,
                  endWT,
                  totalTime,
                  workoutTime,
                  videoSize,
                  0,
                  seriesKey,
                  0,
                  counter,
                );
              }}
            >
              <View style={styles.playingEpisodeView}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={styles.circularImageView}>
                    <Image
                      style={{
                        height: moderateScale(60),
                        width: moderateScale(60),
                        borderRadius: moderateScale(60 / 2),
                      }}
                      source={this.getTitleAndId(0, 0, true)}
                    />
                  </View>
                  <View>
                    <Text style={{
                      fontSize: moderateScale(20),
                      fontWeight: 'bold',
                      color: '#001331',
                      marginLeft: 10,
                      marginRight: 10,
                    }}
                    >
                      {
                        'Play First Episode'
                      }
                    </Text>
                    <Text style={{
                      color: '#001331',
                      fontSize: moderateScale(16),
                      fontWeight: 'bold',
                      marginLeft: 10,
                      marginRight: 10,
                    }}
                    >
                      {
                        this.getTitleAndId(0, 0).title
                      }
                    </Text>
                  </View>
                </View>
                <Icon style={{ alignSelf: 'flex-end' }} name="chevron-thin-right" type="entypo" color="#f5cb23" size={moderateScale(30)} />
              </View>
            </TouchableHighlight>
            <View>
              <ShowModal
                visible={showModal}
                title={modalText}
                description={modalDescription}
                buttonText={buttonText}
                secondButtonText={secondButtonText}
                askAdvance={askAdvance}
                onPress={() => {
                  this.setState({ showModal: false, playEpisode: false, askAdvance: false });
                  if (askAdvance) {
                    this.props.navigation.navigate('LoginSignup');
                  }
                  
                }}
                onSecondButtonPress={() => {
                  this.setState({ showModal: false, playEpisode: false, askAdvance: false });
                  if(playEpisode) {
                    this.onEpisodeClick(
                      downloadTitle,
                      downloadUid,
                      downloadCategory,
                      downloadDescription,
                      downloadExercises,
                      completeExercises,
                      downloadVideo,
                      downloadStartWT,
                      downloadEndWT,
                      downloadTotalTime,
                      downloadWorkoutTime,
                      downloadVideoSize,
                      downloadEpisodeIndex,
                      downloadSeriesKey,
                      downloadSeriesIndex,
                      deviceId,
                      downloadCounter,
                    );
                  }
                }}
              />
            </View>
            {this.renderList()}
          </View>
        </ScrollView>
      </View>
    );
  }
}