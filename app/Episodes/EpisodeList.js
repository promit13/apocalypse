import React from 'react';
import {
  ScrollView, View, Image, TouchableOpacity, Platform,
  StatusBar, PermissionsAndroid, AsyncStorage,
  Modal, ActivityIndicator, Alert, TouchableHighlight,
} from 'react-native';
import RNFetchBlob from 'react-native-fetch-blob';
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
import { NavigationEvents } from 'react-navigation';
import realm from '../config/Database';
import ShowModal from '../common/ShowModal';
import firebase from '../config/firebase';
import LoadScreen from '../common/LoadScreen';
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
    height: scale(200),
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
  iconView: {
    height: moderateScale(40),
    width: moderateScale(50),
    justifyContent: 'center',
  }
};

let seriesBought = false;
class EpisodeList extends React.Component {
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
    completedEpisodesArray: [],
    loading: true,
    purchasedSeries: [],
    filesList: [],
    modalText: '',
    lastPlayedEpisode: '',
    showModal: false,
    showDeleteDialog: false,
    deleteEpisode: false,
    deleteFileTitle: '',
    modalDescription: '',
    downloadActive: false,
    deleteStatus: false,
    showCancel: false,
    showCellularDialog: false,
    pressStatus: false,
  }

  componentDidMount= async () => {
    Orientation.lockToPortrait();
    const { netInfo } = this.props.screenProps;
    const deviceId = DeviceInfo.getDeviceId();
    // console.log(`${RNFetchBlob.fs.dirs.DocumentDir}/AST/`);
    this.readDirectory();
    try {
      if (!netInfo) {
        const offlineData = await AsyncStorage.getItem('series');
        const jsonObjectData = JSON.parse(offlineData);
        const {
          series, purchasedSeries, lastPlayedEpisode, completeEpisodes, completedEpisodesArray, episodeWatchedCount,
        } = jsonObjectData;
        return this.setState({
          loading: false,
          series,
          purchasedSeries,
          lastPlayedEpisode,
          completeEpisodes,
          completedEpisodesArray,
          episodeWatchedCount,
          deviceId,
        });
      }
      this.requestPermissions();
      firebase.database().ref(`userDatas/${this.props.screenProps.user.uid}`).on('value', (snap) => {
        firebase.database().ref(`episodeWatchedCount/${deviceId}`).on('value', (snapWatchCount) => {
          firebase.database().ref('series').on('value', (snapshot) => {
            firebase.database().ref('episodes').on('value', (snapEpisode) => {
              firebase.database().ref('exercises').on('value', (snapExercises) => {
                // firebase.database().ref(`purchases/${this.props.screenProps.user.uid}`).on('value', (snapPurchases) => {
                const completeEpisodes = snapEpisode.val();
                const completeExercises = snapExercises.val();
                const episodeWatchedCount = snapWatchCount.val();
                let loggedLastPlayedEpisode = '';
                let loggedPurchases = '';
                let loggedEpisodeCompletedArray = '';
                if (snap.val() !== null) {
                  const { lastPlayedEpisode, purchases, episodeCompletedArray } = snap.val();
                  if (lastPlayedEpisode !== undefined) {
                    loggedLastPlayedEpisode = lastPlayedEpisode;
                  }
                  if (purchases !== undefined) {
                    loggedPurchases = purchases;
                  }
                  if (episodeCompletedArray !== undefined) {
                    loggedEpisodeCompletedArray = episodeCompletedArray;
                  }
                }
                // const series = Object.values(snapshot.val());
                // const sortedSeries = series.sort((a, b) => parseInt(a.position, 10) - parseInt(b.position, 10));
                const purchasedSeries = Object.entries(loggedPurchases).map(([key, value], i) => {
                  return value.seriesId;
                });
                this.setState({
                  series: snapshot.val(),
                  episodeWatchedCount,
                  lastPlayedEpisode: loggedLastPlayedEpisode,
                  purchasedSeries,
                  loading: false,
                  completedEpisodesArray: Object.values(loggedEpisodeCompletedArray),
                  completeEpisodes,
                  completeExercises,
                  deviceId,
                });
                AsyncStorage.setItem('series', JSON.stringify({
                  uid: this.props.screenProps.user.uid,
                  episodeWatchedCount,
                  series: snapshot.val(),
                  purchasedSeries,
                  lastPlayedEpisode: loggedLastPlayedEpisode,
                  completedEpisodesArray: Object.values(loggedEpisodeCompletedArray),
                  completeEpisodes,
                }));
                // });
              });
            });
          });
        });
      });
    } catch (err) {
      console.warn(err.code, err.message);
    }
  }

  // componentDidUpdate(prevProps, prevState) {
  //   if ((this.props.downloadProgress >= prevState.downloadPercentage) || (this.props.deleteStatus === this.state.deleteStatus)) {
  //     this.readDirectory();
  //   }
  // }

  componentDidUpdate(prevProps, prevState) {
    if (
      (this.props.downloadComplete === prevState.downloadActive)
      || (this.props.deleteStatus === this.state.deleteStatus)
      || (this.props.showCancel === this.state.showCancel)
    ) {
      this.readDirectory();
    }
  }

  componentWillUnmount() {
    RNIap.endConnection();
  }

  onEpisodeClick = (
    checkIndex,
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
    seriesIndex,
    deviceId,
    counter,
    purchased,
    alreadyDownloaded,
    completed,
    download,
  ) => {
    if (download) {
      if (alreadyDownloaded) {
        this.setState({ showDeleteDialog: true, deleteEpisode: true, modalDescription: 'Do you really want to delete episode?', deleteFileTitle: title });
        // this.deleteEpisode(title);
      } else {
        console.log(exercises);
        this.props.downloadEpisode({
          exercises,
          completeExercises,
          episodeTitle: title,
          episodeId,
          category,
          description,
          video,
          totalTime,
          workoutTime,
          videoSize,
          episodeIndex,
          seriesIndex,
          startWT,
          endWT,
        });
      }
      return;
    }
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
      seriesIndex,
      startWT,
      endWT,
      completed,
      counter,
      deviceId,
      purchased,
      offline: alreadyDownloaded,
      episodeList: true,
    });
    // });
  }

  onHideUnderlay() {
    this.setState({ pressStatus: false });
  }

  onShowUnderlay() {
    this.setState({ pressStatus: true });
  }

  getTitleAndId = (seriesIndex, episodeIndex, getImage) => {
    if (this.state.series === '') {
      return console.log('no series');
    }
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
    return { uid, title };
  }

  getEpisodesListSize = (seriesIndex) => {
    if (this.state.series === '') {
      return console.log('no series');
    }
    const { length } = Object.keys(((Object.values(this.state.series))[seriesIndex]).episodes);
    console.log(length);
    return length;
  }

  getEpisodeCount = (episodeIndex, seriesIndex, id) => {
    const { purchasedSeries, episodeWatchedCount } = this.state;
    const buy = seriesBought ? true : purchasedSeries.includes(id);
    let counter = 0;
    if (buy) {
      counter = 3;
      return counter;
    }
    if (episodeIndex < 1 && episodeWatchedCount !== null) {
      counter = episodeWatchedCount[id] !== undefined ? episodeWatchedCount[id].count : 0;
      return counter;
    }
    return counter;
  }

  readDirectory = () => {
    const allEpisodes = Array.from(realm.objects('SavedEpisodes'));
    const files = allEpisodes.map((episodeValue) => {
      return episodeValue.title;
    });
    this.setState({
      filesList: files, index: 0, downloadActive: false, deleteStatus: false, showCancel: false,
    });
  }

  requestPermissions = async () => {
    try {
      if (Platform.OS === 'android') {
        await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
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
        Permissions.check('notification').then((response) => {
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

  sendDataToServer = (uid, purchaseId, transactionReceipt) => {
    firebase.database().ref(`userDatas/${this.props.screenProps.user.uid}/purchases`).push({
      inAppPurchaseId: purchaseId,
      seriesId: uid,
      date: new Date().getTime(),
      transactionReceipt,
    })
      .then(async () => {
        this.setState({ showModal: true, modalText: 'Item purchased successfully' });
        // await RNIap.finishTransaction();
        // await RNIap.consumeAllItems();
        // await RNIap.endConnection();
      })
      .catch(err => this.setState({ showModal: true, modalText: err.message }));
  }

  buyItem = async (uid, purchaseId) => {
    this.sendDataToServer(uid, purchaseId, 'fasdfsdf');
    // try {
    //   await RNIap.clearTransaction();
    //   const product = await RNIap.getProducts([purchaseId]);
    //   if (this.state.Platform === 'ios') {
    //     const purchase = await RNIap.buyProductWithoutFinishTransaction(product[0].productId);
    //     const { transactionReceipt } = purchase;
    //     this.sendDataToServer(uid, purchaseId, transactionReceipt);
    //   } else {
    //     const purchase = await RNIap.buyProduct(product[0].productId);
    //     const { transactionReceipt } = purchase;
    //     this.sendDataToServer(uid, purchaseId, transactionReceipt);
    //   }
    // } catch (err) {
    //   this.setState({ showModal: true, modalText: err.message });
    //   RNIap.endConnection();
    // }
  }

  deleteEpisode = (fileName) => {
    // this.child.deleteEpisodes(fileName);
    // this.setState({ deleteStatus: true });
    this.props.deleteEpisodeList(fileName);
  }

  onRightIconPress = (
    buy, downloaded, title, uid, category, description, exercises, video, startWT, endWT,
    totalTime, workoutTime, videoSize, episodeIndex, seriesIndex, completed,
  ) => {
    const { netInfo, connectionType } = this.props.screenProps;
    const { completeExercises, deviceId, downloadActive } = this.state;
    if (!netInfo) {
      return this.setState({ showModal: true, modalText: 'Please check your internet connection' });
    }
    if (this.state.downloadActive) {
      return this.setState({ showModal: true, modalText: 'Please wait while download finishes' });
    }
    // if ((!buy && episodeIndex > 2) || (!buy && seriesIndex > 0) || (!buy && counterArray[episodeIndex] >= 2)) {
    //   return this.setState({ showModal: true, modalText: 'Item not purchased' });
    // }
    if (!buy) {
      return this.setState({ showModal: true, modalText: 'Item not purchased' });
    }
    if (connectionType === 'cellular' && !downloaded) {
      return this.setState({
        showCellularDialog: true,
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
        downloadSeriesIndex: seriesIndex,
        downloadBuy: buy,
        downloadDownloaded: downloaded,
        downloadCompleted: completed,
      });
    }
    this.setState({ index: (episodeIndex + 1), downloadActive: true },
      () => {
        this.onEpisodeClick(
          (episodeIndex + 1),
          title,
          uid,
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
          seriesIndex,
          deviceId,
          0,
          buy,
          downloaded,
          completed,
          true,
        );
      });
  }

  renderList = () => {
    const {
      series, purchasedSeries, completeEpisodes, filesList,
      completedEpisodesArray, lastPlayedEpisode, deviceId,
      episodeWatchedCount, index, downloadActive, completeExercises,
    } = this.state;
    const { netInfo, connectionType } = this.props.screenProps;
    // const counterArray = [];
    console.log(connectionType);
    const seriesList = Object.entries(series).map(([seriesKey, value], seriesIndex) => {
      seriesBought = purchasedSeries.includes(seriesKey);
      // minIndex = maxIndex + 1;
      if (value.episodes === undefined) {
        return console.log('no episodes added');
      }
      // maxIndex += Object.keys(value.episodes).length; // value.episodes.length ;
      const seriesLength = Object.keys(value.episodes).length;
      const episodesList = Object.entries(value.episodes)
        .map(([episodeKey, episodeValue], episodeIndex) => {
          const { uid } = episodeValue;
          const {
            title, category, totalTime, workoutTime, videoSize, description, exercises, video, startWT, endWT,
            price, iosID, googleID,
          } = completeEpisodes[uid];
          const buy = seriesBought ? true : purchasedSeries.includes(uid);
          // const formattedFileName = `${title.replace(/ /g, '_')}.mp4`;
          const downloaded = filesList.includes(title);
          let completed = completedEpisodesArray.some((el) => {
            return el.episodeId === uid;
          });
          const currentEpisode = lastPlayedEpisode.episodeId;
          if (currentEpisode === uid) {
            completed = undefined;
          }
          // if (!buy && episodeIndex <= 2) {
          //   if (episodeWatchedCount !== null) {
          //     counter = episodeWatchedCount[episodeIndex] !== undefined ? episodeWatchedCount[episodeIndex].count : 0;
          //     counterArray.push(counter);
          //   } else {
          //     counterArray.push(0);
          //   }
          // }
          // if (episodeWatchedCount !== null) {
          //   counter = episodeWatchedCount[uid] === undefined ? 0 : episodeWatchedCount[uid].count;
          // }
          const counter = episodeWatchedCount === null ? 0 : episodeWatchedCount[uid] === undefined ? 0 : episodeWatchedCount[uid].count;
          return (
            <ListItem
              key={episodeKey}
              leftIcon={
                currentEpisode === uid
                  ? { name: 'unmute', type: 'octicon', color: '#f5cb23', size: moderateScale(20) }
                  : (
                      completed
                        ? { name: 'circle-thin', type: 'font-awesome', color: '#7a6306', size: moderateScale(15) }
                        : { name: 'circle', type: 'font-awesome', color: '#f5cb23', size: moderateScale(15) }
                  )
              }
              title={`${episodeIndex + 1}. ${title}`}
              subtitle={`${category} - ${videoSize} MB`}
              titleStyle={{ color: (!buy && episodeIndex > 0) || (!buy && seriesIndex > 0) || (!buy && counter >= 2) ? 'gray' : 'white', fontSize: moderateScale(18) }}
              subtitleStyle={{ color: (!buy && episodeIndex > 0) || (!buy && seriesIndex > 0) || (!buy && counter >= 2) ? 'gray' : 'white', fontSize: moderateScale(10) }}
              rightIcon={
                !buy
                  ? (
                      <Button
                        title={(episodeIndex === 0) && (counter < 2) ? '  TRY  ' : `£${price}`}
                        fontSize={moderateScale(12)}
                        buttonStyle={[styles.purchaseButtonStyle, { backgroundColor: 'green' }]}
                        onPress={() => {
                          if (!netInfo) {
                            return this.setState({ showModal: true, modalText: 'Please check your internet connection' });
                          }
                          if((episodeIndex === 0) && (counter < 2)) {
                            return this.onEpisodeClick(
                              (episodeIndex + 1),
                              title,
                              uid,
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
                              seriesIndex,
                              deviceId,
                              counter,
                              buy,
                              downloaded,
                              completed,
                            );
                          }
                          const purchaseId = Platform.OS === 'android' ? googleID : iosID;
                          this.buyItem(uid, purchaseId);
                        }
                      }
                      />
                    )
                  : (
                    downloaded
                  // ? { name: 'trash-2', type: 'feather', color: 'white', size: moderateScale(40), containerStyle: { padding : moderateScale(50) }}
                  ? (
                    <View style={styles.iconView}>
                      <TouchableOpacity hitSlop={{top: 10, bottom: 10 }} onPress={() => {
                        console.log('RIGHT ICON PRESSED');
                        this.onRightIconPress(
                          buy, downloaded, title, uid, category, description, exercises, video, startWT, endWT,
                          totalTime, workoutTime, videoSize, episodeIndex, seriesIndex, completed,
                        );
                      }}>
                      <Icon
                        name="trash-2"
                        type="feather"
                        color="white"
                        size={moderateScale(25)}
                      />
                      </TouchableOpacity>
                    </View>
                  ) 
                  : (
                      downloadActive && index === (episodeIndex + 1)
                      ?  (
                        <TouchableOpacity onPress={() => {
                          console.log(index, episodeIndex + 1, downloadActive);
                          this.setState({ showDeleteDialog: true, modalDescription: 'Do you really want to cancel download?', deleteFileTitle: title })
                        }}>
                          <Progress.Circle
                              progress={this.props.downloadProgress}
                              showsText
                              size={moderateScale(30)}
                              color='white'
                              borderColor='white'
                              textStyle={{ fontSize: moderateScale(10) }}
                              borderWidth={1}
                              thickness={1}
                            />
                        </TouchableOpacity>
                        )
                    // : { name: 'download', type: 'feather', color: !buy ? 'gray' : 'white', size: moderateScale(40), containerStyle: { padding : moderateScale(50) }}
                       : (
                         <View style={styles.iconView}>
                          <TouchableOpacity hitSlop={{top: 10, bottom: 10 }} onPress={() => {
                            console.log('RIGHT ICON PRESSED');
                            this.onRightIconPress(
                              buy, downloaded, title, uid, category, description, exercises, video, startWT, endWT,
                              totalTime, workoutTime, videoSize, episodeIndex, seriesIndex, completed,
                            );
                          }}>
                          <Icon
                            name="download"
                            type="feather"
                            color={!buy ? 'gray' : 'white'}
                            size={moderateScale(25)}
                          />
                          </TouchableOpacity>
                        </View>
                       )
                    )
                  )
                }
              containerStyle={{ backgroundColor: '#33425a' }}
              underlayColor="#2a3545"
              onPressRightIcon={() => {}}
              onPress={() => {
                console.log(counter);
                // const count = episodeWatchedCount[uid] === undefined ? 0 : episodeWatchedCount[uid].count;
                if (!netInfo && !downloaded) {
                  return this.setState({ showModal: true, modalText: 'Please check your internet connection' });
                }
                if ((!buy && episodeIndex > 0) || (!buy && seriesIndex > 0) || (!buy && counter >= 2)) {
                  return this.setState({ showModal: true, modalText: 'Item not purchased' });
                }
                this.onEpisodeClick(
                  (episodeIndex + 1),
                  title,
                  uid,
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
                  seriesIndex,
                  deviceId,
                  counter,
                  buy,
                  downloaded,
                  completed,
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
                seriesBought
                  ? (
                    <Button
                      title="Purchased"
                      fontSize={moderateScale(12)}
                      buttonStyle={[styles.purchaseButtonStyle, { borderColor: 'white', borderWidth: 1 }]}
                      onPress={() => {
                        if (!netInfo) {
                          return this.setState({ showModal: true, modalText: 'Please check your internet connection' });
                        }
                      }}
                    />)
                  : (
                    <Button
                      title={`    £${value.price}    `}
                      fontSize={moderateScale(12)}
                      buttonStyle={[styles.purchaseButtonStyle, { backgroundColor: 'green' }]}
                      onPress={() => {
                        if (!netInfo) {
                          return this.setState({ showModal: true, modalText: 'Please check your internet connection' });
                        }
                        const purchaseId = Platform.OS === 'android' ? value.googleID : value.iosID;
                        this.buyItem(seriesKey, purchaseId, value.price);
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
      <Modal transparent visible={this.props.showCancel}>
        <View style={styles.modalView}>
          <View style={styles.modalInnerView}>
            <ActivityIndicator size="large" color="#001331" style={{ marginTop: 20 }} />
            <Text style={[styles.textStyle, { color: '#001331' }]}>
              Cancelling download
            </Text>
          </View>
        </View>
      </Modal>
    );
  }

  render() {
    const {
      lastPlayedEpisode, completeEpisodes, loading, showModal,
      modalText, deviceId, showDeleteDialog, deleteEpisode,
      deleteFileTitle, downloadActive, modalDescription, completeExercises, showCellularDialog, pressStatus,
      downloadTitle, downloadUid, downloadCategory, downloadDescription, downloadExercises,
      downloadVideo, downloadStartWT, downloadEndWT, downloadTotalTime,
      downloadWorkoutTime, downloadVideoSize, downloadEpisodeIndex,
      downloadSeriesIndex, downloadBuy, downloadDownloaded, downloadCompleted,
    } = this.state;
    const { netInfo } = this.props.screenProps;
    if (loading) return <LoadScreen text="Preparing your apocalypse" />;
    const {
      episodeTitle,
      episodeId,
      episodeIndex,
      seriesIndex,
      episodeCompleted,
    } = lastPlayedEpisode;
    return (
      <View style={styles.mainContainer}>
        {/* <StatusBar hidden /> */}
        <StatusBar backgroundColor="#00000b" barStyle="light-content" />
        { !netInfo ? <OfflineMsg margin={18} showText /> : null }
        <NavigationEvents
          onDidFocus={() => { downloadActive ? null : this.readDirectory(); }}
        />
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
              onHideUnderlay={() => this.onHideUnderlay()}
              onShowUnderlay={() => this.onShowUnderlay()}
              onPress={() => {
                if (!netInfo) {
                  return this.setState({ showModal: true, modalText: 'Please check your internet connection' });
                }
                const epIndex = lastPlayedEpisode === ''
                  ? 0
                  : (
                      episodeCompleted
                      ? (
                            (episodeIndex + 1) === this.getEpisodesListSize(seriesIndex)
                              ? 0
                              : (episodeIndex + 1)
                        )
                      : episodeIndex
                    )
                const serIndex = lastPlayedEpisode === '' ? 0 : seriesIndex;
                const id = lastPlayedEpisode === ''
                  ? this.getTitleAndId(0, 0).uid
                  : (
                      episodeCompleted
                        ? (
                            (episodeIndex + 1) === this.getEpisodesListSize(seriesIndex)
                              ? this.getTitleAndId(seriesIndex, 0).uid
                              : this.getTitleAndId(seriesIndex, episodeIndex + 1).uid
                          )
                        : episodeId
                    )
                const counter = this.getEpisodeCount(epIndex, serIndex, id);
                console.log(counter);
                if (counter === 2) {
                  return this.setState({ showModal: true, modalText: 'Item not purchased' });
                }
                const buy = counter === 3 ? true : false;
                const {
                  totalTime, workoutTime, videoSize, title, category, description, exercises, video, startWT, endWT,
                } = completeEpisodes[id];
                
                this.onEpisodeClick(
                  (epIndex + 1),
                  title,
                  id,
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
                  epIndex,
                  serIndex,
                  deviceId,
                  counter,
                  buy,
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
                      source={
                        lastPlayedEpisode === ''
                          ? this.getTitleAndId(0, 0, true)
                          : (
                            episodeCompleted
                                ? (
                                    (episodeIndex + 1) === this.getEpisodesListSize(seriesIndex)
                                      ? this.getTitleAndId(seriesIndex, 0, true)
                                      : this.getTitleAndId(seriesIndex, episodeIndex + 1, true)
                                  )
                                : this.getTitleAndId(seriesIndex, episodeIndex, true)
                            )
                        }
                    />
                  </View>
                  <View>
                    <Text style={{
                      fontSize: moderateScale(20),
                      fontWeight: 'bold',
                      color: pressStatus ? 'white' : '#001331',
                      marginLeft: 10,
                      marginRight: 10,
                    }}
                    >
                      {
                        lastPlayedEpisode === ''
                          ? 'Play First Episode'
                          : (
                              episodeCompleted
                                ? (
                                    (episodeIndex + 1)=== this.getEpisodesListSize(seriesIndex)
                                      ? 'Play First Episode'
                                      : 'Play Next Episode'
                                  )
                                : 'Play Current Episode'
                            )
                      }
                    </Text>
                    <Text style={{
                      color: pressStatus ? 'white' : '#001331',
                      fontSize: moderateScale(16),
                      fontWeight: 'bold',
                      marginLeft: 10,
                      marginRight: 10,
                    }}
                    >
                      {
                        lastPlayedEpisode === ''
                          ? this.getTitleAndId(0, 0).title
                          : (
                              episodeCompleted
                                ? (
                                    (episodeIndex + 1) === this.getEpisodesListSize(seriesIndex)
                                      ? this.getTitleAndId(seriesIndex, 0).title
                                      : this.getTitleAndId(seriesIndex, episodeIndex + 1).title
                                  )
                                : episodeTitle
                            )
                      }
                    </Text>
                  </View>
                </View>
                <Icon style={{ alignSelf: 'flex-end' }} name="chevron-thin-right" type="entypo" color="#f5cb23" size={moderateScale(30)} />
              </View>
            </TouchableHighlight>
            <View>
              {/* {this.showModal()} */}
              <ShowModal
                visible={showModal}
                title={modalText}
                buttonText="OK"
                onPress={() => {
                  this.setState({ showModal: false });
                }}
              />
              <ShowModal
                visible={showDeleteDialog}
                description={modalDescription}
                buttonText={deleteEpisode ? 'Cancel' : 'No'}
                secondButtonText={deleteEpisode ? 'Confirm' : 'Yes'}
                askAdvance
                onSecondButtonPress={() => {
                  deleteEpisode ? this.deleteEpisode(deleteFileTitle) : this.props.stopDownload(deleteFileTitle);
                  this.setState({
                    showCancel: deleteEpisode ? false : true,
                    showDeleteDialog: false,
                    deleteStatus: true,
                    deleteEpisode: false,
                  });
                }}
                onPress={() => this.setState({
                  downloadActive: deleteEpisode ? false : true,
                  showDeleteDialog: false,
                  deleteEpisode: false,
                })}
              />
              <ShowModal
                visible={showCellularDialog}
                title="You are about to download using your mobile network data."
                description={`Because of the size of the files, we recommend using wifi.\nDownloading over slow connections may take some time.`}
                secondButtonText="Continue"
                buttonText="Cancel"
                askAdvance
                onPress={() => this.setState({ showCellularDialog: false })}
                onSecondButtonPress={() => {
                  this.setState({ index: (downloadEpisodeIndex + 1), downloadActive: true, showCellularDialog: false },
                    () => {
                      this.onEpisodeClick(
                        0,
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
                        downloadSeriesIndex,
                        deviceId,
                        0,
                        downloadBuy,
                        downloadDownloaded,
                        downloadCompleted,
                        true,
                      );
                    });
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

const mapStateToProps = ({ download, deleteEpisodeListReducer }) => {
  const { downloadProgress, showCancel, downloadComplete } = download;
  const { message } = deleteEpisodeListReducer;
  return { downloadProgress, deleteStatus: message, showCancel, downloadComplete };
};

const mapDispatchToProps = {
  downloadEpisode,
  deleteEpisodeList,
  stopDownload,
  stopIOSDownload,
};

export default connect(mapStateToProps, mapDispatchToProps)(EpisodeList);
