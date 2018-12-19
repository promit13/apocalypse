import React from 'react';
import {
  ScrollView, View, Image, TouchableOpacity, Platform, StatusBar, PermissionsAndroid, AsyncStorage, Dimensions, ActivityIndicator,
} from 'react-native';
import {
  Text, ListItem, Icon, Button, List,
} from 'react-native-elements';
import * as RNIap from 'react-native-iap';
import { connect } from 'react-redux';
import Permissions from 'react-native-permissions';
import RNFetchBlob from 'react-native-fetch-blob';
import Orientation from 'react-native-orientation';
import DeviceInfo from 'react-native-device-info';
import ShowModal from '../common/ShowModal';
import firebase from '../config/firebase';
import LoadScreen from '../common/LoadScreen';
import OfflineMsg from '../common/OfflineMsg';
import DeleteDownloads from '../common/DeleteDownloads';
import store from '../store';
import downloadEpisode from '../actions/download';

const { width } = Dimensions.get('window');
const imageSize = width - 110;

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
    height: imageSize,
  },
  textStyle: {
    color: 'white',
    fontSize: 18,
  },
  purchaseButtonStyle: {
    alignItems: 'flex-end',
    backgroundColor: '#001331',
    borderRadius: 5,
  },
  episodeHeaderView: {
    padding: 15,
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
    padding: 10,
  },
  circularImageView: {
    height: 60,
    width: 60,
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 60 / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
};

class EpisodeList extends React.Component {
  static navigationOptions = {
    header: null,
  };

  state = {
    index: 0,
    deviceId: '',
    series: '',
    episodeWatchedCount: '',
    completeEpisodes: '',
    completedEpisodesArray: [],
    loading: true,
    purchasedSeries: [],
    filesList: [],
    modalText: '',
    lastPlayedEpisode: '',
    isConnected: true,
    downloaded: false,
    showModal: false,
    showDeleteDialog: false,
    showLoading: false,
    deleteFileTitle: '',
    checkDownloadStatus: false,
    downloadActive: false,
  }

  componentDidMount= async () => {
    Orientation.lockToPortrait();
    const { netInfo } = this.props.screenProps;
    const deviceId = DeviceInfo.getDeviceId();
    // Alert.alert(deviceId);

    // try {
    //   const completedEpisodesArray = await AsyncStorage.getItem('episodeCompletedArray');
    //   if (completedEpisodesArray === null) {
    //     this.setState({ isConnected: netInfo });
    //   } else {
    //     this.setState({ isConnected: netInfo, completedEpisodesArray: JSON.parse(completedEpisodesArray) });
    //   }
    // } catch (err) {
    //   console.log(err.code, err.message);
    // }
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
          isConnected: netInfo,
          episodeWatchedCount,
          deviceId,
        });
      }
      // await RNIap.initConnection();
      this.requestPermissions();
      firebase.database().ref(`users/${this.props.screenProps.user.uid}`).on('value', (snap) => {
        if (snap.val() === null) {
          return;
        }
        firebase.database().ref(`episodeWatchedCount/${deviceId}`).on('value', (snapWatchCount) => {
          firebase.database().ref('series').on('value', (snapshot) => {
            firebase.database().ref('episodes').on('value', (snapEpisode) => {
              const completeEpisodes = snapEpisode.val();
              const series = Object.values(snapshot.val());
              const episodeWatchedCount = snapWatchCount.val() !== null ? Object.values(snapWatchCount.val()) : null;
              const { purchases, lastPlayedEpisode, episodeCompletedArray } = snap.val();
              const sortedSeries = series.sort((a, b) => parseInt(a.position, 10) - parseInt(b.position, 10));
              const purchasedSeries = Object.entries(purchases).map(([key, value], i) => {
                return value.seriesId;
              });
              this.setState({
                series: sortedSeries,
                episodeWatchedCount,
                lastPlayedEpisode,
                purchasedSeries,
                loading: false,
                completedEpisodesArray: Object.values(episodeCompletedArray),
                completeEpisodes,
                isConnected: netInfo,
                deviceId,
              });
              AsyncStorage.setItem('series', JSON.stringify({
                uid: this.props.screenProps.user.uid,
                episodeWatchedCount,
                series: sortedSeries,
                purchasedSeries,
                lastPlayedEpisode,
                completedEpisodesArray: Object.values(episodeCompletedArray),
                completeEpisodes,
              }));
            });
          });
        });
      });
    } catch (err) {
      console.warn(err.code, err.message);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.downloadStatus === prevState.downloadActive) {
      this.readDirectory();
      this.renderList();
    }
    // if (this.props.navigation.state.params === undefined) {
    //   return;
    // }
    // if (this.props.navigation.state.params.downloaded !== prevState.downloaded) {
    //   this.readDirectory();
    //   this.renderList();
    // }
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
    const { index } = this.state;
     console.log('CHECK INDEX', checkIndex, index, this.props.downloadStatus);
    if (download) {
      if (alreadyDownloaded) {
        this.setState({ showDeleteDialog: true, deleteFileTitle: title });
        // this.deleteEpisode(title);
      } else {
        this.props.downloadEpisode({
          exercises,
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

  getEpisodeCount = (episodeIndex, seriesIndex) => {
    const { purchasedSeries, episodeWatchedCount } = this.state;
    const buy = purchasedSeries.includes(seriesIndex.toString());
    let counter = 0;
    if (buy) {
      counter = 3;
      return counter;
    }
    if (episodeIndex <= 2 && episodeWatchedCount !== null) {
      counter = episodeWatchedCount[episodeIndex] !== undefined ? episodeWatchedCount[episodeIndex].count : 0;
      return counter;
    }
    return counter;
  }

  readDirectory = (check) => {
    const { dirs, ls } = RNFetchBlob.fs;
    ls(`${dirs.DocumentDir}/AST/episodes`)
      .then((files) => {
        this.setState({ filesList: files, index: 0, downloadActive: false });
        if (check) {
          this.setState({ filesList: files, index: 0, downloadActive: false });
        } else {
          // this.setState({ filesList: files });
          this.setState({ filesList: files });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  requestPermissions = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        ]);
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('You can access location');
        } else {
          console.log('Location permission denied');
        }
      } else {
        Permissions.check('motion').then((response) => {
          if (response !== 'authorized') {
            Permissions.request(['motion', 'notification']).then((res) => {
              console.log(res);
            });
          }
        });
      }
    } catch (err) {
      console.log(err);
    }
  }

  buyItem = async (item, itemId, itemPrice) => {
    try {
      // await RNIap.prepare();
      // const purchase = await RNIap.buyProductWithoutFinishTransaction(itemId);
      // // to something in your server
      // const { transactionReceipt, purchaseToken } = purchase;
      firebase.database().ref(`users/${this.props.screenProps.user.uid}/purchases`).push({
        inAppPurchaseId: itemId,
        seriesId: item,
        price: itemPrice,
        date: new Date().getTime(),
        transactionReceipt: 'kdjfkalkf',
        purchaseToken: 'fjskjdfkjas',
      })
        .then(() => {
          this.setState({ showModal: true, modalText: 'Item purchased successfully' });
          RNIap.finishTransaction();
        });
    } catch (err) {
      this.setState({ showModal: true, modalText: err.message });
      RNIap.endConnection();
    }
  }

  deleteEpisode = (fileName) => {
    const { dirs } = RNFetchBlob.fs;
    const formattedFileName = fileName.replace(/ /g, '_');
    RNFetchBlob.fs.exists(`${dirs.DocumentDir}/AST/episodes/${formattedFileName}.mp4`)
      .then((exists) => {
        if (exists) {
          this.child.deleteEpisodes(fileName);
        }
        this.readDirectory(true);
        this.renderList();
      });
  }

  renderList = () => {
    const {
      series, purchasedSeries, completeEpisodes, isConnected, filesList, completedEpisodesArray, lastPlayedEpisode, deviceId, episodeWatchedCount, index, downloadActive, checkDownloadStatus,
    } = this.state;
    console.log('Renderlist', downloadActive, index);
    let counter;
    const counterArray = [];
    const seriesList = Object.entries(series).map(([seriesKey, value], seriesIndex) => {
      const buy = purchasedSeries.includes(seriesKey);
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
          } = completeEpisodes[uid];
          const formattedFileName = `${title.replace(/ /g, '_')}.mp4`;
          const downloaded = filesList.includes(formattedFileName);
          let completed = completedEpisodesArray.some((el) => {
            return el.episodeId === uid;
          });
          const currentEpisode = lastPlayedEpisode.episodeId;
          if (currentEpisode === uid) {
            completed = undefined;
          }
          if (!buy && episodeIndex <= 2) {
            if (episodeWatchedCount !== null) {
              counter = episodeWatchedCount[episodeIndex] !== undefined ? episodeWatchedCount[episodeIndex].count : 0;
              counterArray.push(counter);
            } else {
              counterArray.push(0);
            }
          }
          return (
            <ListItem
              key={episodeKey}
              leftIcon={
                currentEpisode === uid
                  ? { name: 'unmute', type: 'octicon', color: '#f5cb23', size: 20 }
                  : (
                      completed
                        ? { name: 'circle-thin', type: 'font-awesome', color: '#7a6306', size: 15 }
                        : { name: 'circle', type: 'font-awesome', color: '#f5cb23', size: 15 }
                  )
              }
              title={`${episodeIndex + 1}. ${title}`}
              subtitle={`${category} - ${videoSize} MB`}
              titleStyle={{ color: (!buy && episodeIndex > 2) || (!buy && seriesIndex > 0) || (!buy && counter >= 2) ? 'gray' : 'white', fontSize: 18 }}
              subtitleStyle={{ color: (!buy && episodeIndex > 2) || (!buy && seriesIndex > 0) || (!buy && counter >= 2) ? 'gray' : 'white' }}
              rightIcon={
                  downloaded
                  ? { name: 'trash-2', type: 'feather', color: 'white' }
                  : (
                      this.props.downloadStatus && !downloadActive && index === (episodeIndex + 1)
                        ? { name: 'trash-2', type: 'feather', color: 'white' }
                        : (
                            downloadActive && index === (episodeIndex + 1)
                            ?  <ActivityIndicator size="small" color="gray" />
                            : { name: 'download', type: 'feather', color: 'white' }
                          )
                    )
                // : { name: 'download', type: 'feather', color: (!buy && episodeIndex > 2) || (!buy && seriesIndex > 0) || (!buy && counter >= 2) ? 'gray' : 'white' }
                }
              containerStyle={{ backgroundColor: '#33425a' }}
              underlayColor="#2a3545"
              onPressRightIcon={() => {
                if (!isConnected) {
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
                this.setState({ index: (episodeIndex + 1), downloadActive: true },
                  () => {
                    this.onEpisodeClick(
                      (episodeIndex + 1),
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
                      seriesIndex,
                      deviceId,
                      counterArray[episodeIndex],
                      buy,
                      downloaded,
                      completed,
                      true,
                    );
                  });
              }
              }
              onPress={() => {
                if (!isConnected && !downloaded) {
                  return this.setState({ showModal: true, modalText: 'Please check your internet connection' });
                }
                if ((!buy && episodeIndex > 2) || (!buy && seriesIndex > 0) || (!buy && counterArray[episodeIndex] >= 2)) {
                  return this.setState({ showModal: true, modalText: 'Item not purchased' });
                }
                this.onEpisodeClick(
                  (episodeIndex + 1),
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
                  seriesIndex,
                  deviceId,
                  counterArray[episodeIndex],
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
                buy
                  ? (
                    <Button
                      title="Purchased"
                      buttonStyle={[styles.purchaseButtonStyle, { borderColor: 'white', borderWidth: 1 }]}
                      onPress={() => {
                        if (!this.state.isConnected) {
                          return this.setState({ showModal: true, modalText: 'Please check your internet connection' });
                        }
                      }}
                    />)
                  : (
                    <Button
                      title={`    £${value.price}    `}
                      buttonStyle={[styles.purchaseButtonStyle, { backgroundColor: 'green' }]}
                      onPress={() => {
                        if (!this.state.isConnected) {
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

  render() {
    const {
      isConnected, lastPlayedEpisode, completeEpisodes, loading, showModal, modalText, deviceId, showDeleteDialog, deleteFileTitle,
    } = this.state;
    if (loading) return <LoadScreen />;
    console.log(this.props.downloadStatus);
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
        <DeleteDownloads ref={ref => (this.child = ref)} />
        { !isConnected ? <OfflineMsg margin={18} /> : null }
        <ScrollView>
          <View>
            <Image
              style={styles.imageStyle}
              resizeMode="stretch"
              resizeMethod="resize"
              source={homeCover}
            />
            <TouchableOpacity onPress={() => {
              if (!isConnected) {
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
              const counter = this.getEpisodeCount(epIndex, serIndex);
              if (counter === 2) {
                return this.setState({ showModal: true, modalText: 'Item not purchased' });
              }
              const buy = counter === 3 ? true : false;
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
                        height: 60,
                        width: 60,
                        borderRadius: 60 / 2,
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
                      fontSize: 20,
                      fontWeight: 'bold',
                      color: '#001331',
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
                      color: '#001331',
                      fontSize: 16,
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
                <Icon style={{ alignSelf: 'flex-end' }} name="chevron-thin-right" type="entypo" color="#f5cb23" />
              </View>
            </TouchableOpacity>
            <View>
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
                description="Do you really want to delete episode?"
                buttonText="Cancel"
                secondButtonText="Confirm"
                askAdvance
                onSecondButtonPress={() => {
                  this.setState({ showDeleteDialog: false });
                  this.deleteEpisode(deleteFileTitle);
                }}
                onPress={() => this.setState({ showDeleteDialog: false })}
              />
            </View>
            {this.renderList()}
          </View>
        </ScrollView>
      </View>
    );
  }
}

const mapStateToProps = ({ download }) => {
  return { downloadStatus: download.message };
};

const mapDispatchToProps = {
  downloadEpisode,
};

export default connect(mapStateToProps, mapDispatchToProps)(EpisodeList);
