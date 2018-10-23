import React from 'react';
import {
  ScrollView, View, Image, TouchableOpacity, Platform, StatusBar, Alert, PermissionsAndroid, AsyncStorage,
} from 'react-native';
import {
  Text, ListItem, Icon, Button,
} from 'react-native-elements';
import * as RNIap from 'react-native-iap';
import Permissions from 'react-native-permissions';
import RNFetchBlob from 'react-native-fetch-blob';
import firebase from '../config/firebase';
import LoadScreen from '../common/LoadScreen';
import OfflineMsg from '../common/OfflineMsg';
import Download from '../common/Download';
import PortraitScreen from '../common/ScreenMode';

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
    marginTop: 20,
    width: '100%',
    height: 200,
  },
  textStyle: {
    color: 'white',
    fontSize: 18,
  },
  purchaseButtonStyle: {
    alignItems: 'flex-end',
    backgroundColor: '#001331',
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 5,
  },
  priceButtonStyle: {
    alignItems: 'flex-end',
    backgroundColor: 'green',
    borderWidth: 1,
    borderColor: 'white',
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

export default class EpisodeList extends PortraitScreen {
  static navigationOptions = {
    header: null,
  };

  state = {
    series: '',
    completeEpisodes: '',
    loading: true,
    purchasedSeries: [],
    filesList: [],
    lastPlayedEpisode: '',
    isConnected: true,
  }

  componentDidMount= async () => {
    const { netInfo } = this.props.screenProps;
    this.setState({ isConnected: netInfo });
    this.readDirectory();
    try {
      if (!netInfo) {
        const offlineData = await AsyncStorage.getItem('series');
        const jsonObjectData = JSON.parse(offlineData);
        const {
          series, purchasedSeries, lastPlayedEpisode, completeEpisodes,
        } = jsonObjectData;
        return this.setState({
          loading: false, series, purchasedSeries, lastPlayedEpisode, completeEpisodes,
        });
      }
      // await RNIap.initConnection();
      this.requestPermissions();
      firebase.database().ref(`users/${this.props.screenProps.user.uid}`).on('value', (snap) => {
        if (snap.val() === null) {
          return;
        }
        const { purchases, lastPlayedEpisode } = snap.val();
        firebase.database().ref('series').on('value', (snapshot) => {
          firebase.database().ref('episodes').on('value', (snapEpisode) => {
            const completeEpisodes = snapEpisode.val();
            const series = Object.values(snapshot.val());
            const sortedSeries = series.sort((a, b) => parseInt(a.position, 10) - parseInt(b.position, 10));
            const purchasedSeries = Object.entries(purchases).map(([key, value], i) => {
              return value.seriesId;
            });
            this.setState({
              series: sortedSeries, lastPlayedEpisode, purchasedSeries, loading: false, completeEpisodes,
            });
            AsyncStorage.setItem('series', JSON.stringify({
              series: sortedSeries,
              purchasedSeries,
              lastPlayedEpisode,
              completeEpisodes,
            })).then(() => {
            });
          });
        });
      });
    } catch (err) {
      console.warn(err.code, err.message);
    }
  }

  componentWillUnmount() {
    RNIap.endConnection();
  }

  onEpisodeClick = (episodeId, totalTime, workoutTime, videoSize, index, alreadyDownloaded, download) => {
    if (!this.state.isConnected ) {
      return Alert.alert('No internet connection');
    }
    this.setState({ loading: true });
    firebase.database().ref(`episodes/${episodeId}`).on('value', (snapshot) => {
      const {
        title, category, description, exercises, video,
      } = snapshot.val();
      this.setState({ loading: false });
      if (download) {
        if (alreadyDownloaded) {
          this.deleteEpisode(title);
        }
        // return this.donwloadFile(title, video);
        return this.props.navigation.navigate('DownloadFiles', {
          episodeId,
          episodeTitle: title,
          category,
          description,
          exercises,
          video,
          totalTime,
          workoutTime,
          videoSize,
        });
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
        index,
        offline: alreadyDownloaded,
      });
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
            Permissions.request('motion').then((res) => {
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
      await RNIap.prepare();
      const purchase = await RNIap.buyProductWithoutFinishTransaction(itemId);
      // to something in your server
      const { transactionReceipt, purchaseToken } = purchase;
      firebase.database().ref(`users/${this.props.screenProps.user.uid}/purchases`).push({
        inAppPurchaseId: itemId,
        seriesId: item,
        price: itemPrice,
        date: new Date().getTime(),
        transactionReceipt,
        purchaseToken,
      })
        .then(() => {
          Alert.alert('Item purchased');
          RNIap.finishTransaction();
        });
    } catch (err) {
      Alert.alert(err.message);
      RNIap.endConnection();
    }
  }

  readDirectory = () => {
    const { dirs, ls } = RNFetchBlob.fs;
    ls(`${dirs.DocumentDir}/AST/episodes`)
      .then((files) => {
        if (files.length === 0) {
          Alert.alert('You have no any downloads');
        }
        this.setState({ filesList: files });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  deleteEpisode = (fileName) => {
    this.child.deleteEpisodes(fileName);
  }

  renderList = () => {
    const {
      series, purchasedSeries, completeEpisodes, isConnected, filesList,
    } = this.state;
    console.log(filesList);
    let minIndex = 0;
    let maxIndex = 0;
    const seriesList = Object.entries(series).map(([seriesKey, value], i) => {
      const buy = purchasedSeries.includes(seriesKey);
      minIndex = maxIndex + 1;
      if (value.episodes === undefined) {
        return console.log('no episodes added');
      }
      maxIndex += Object.keys(value.episodes).length; // value.episodes.length ;
      const episodesList = Object.entries(value.episodes)
        .map(([episodeKey, episodeValue], episodeIndex) => {
          const { uid } = episodeValue;
          const {
            title, category, totalTime, workoutTime, videoSize,
          } = completeEpisodes[uid];
          const formattedFileName = `${title.replace(/ /g, '_')}.mp4`;
          const downloaded = filesList.includes(formattedFileName);
          console.log(formattedFileName);
          return (
            <ListItem
              key={episodeKey}
              title={`${episodeIndex + minIndex}. ${title}`}
              subtitle={category}
              titleStyle={{ color: (!buy && episodeIndex > 2) || (!buy && i > 0) ? 'gray' : 'white', fontSize: 18 }}
              subtitleStyle={{ color: (!buy && episodeIndex > 2) || (!buy && i > 0) ? 'gray' : 'white' }}
              rightIcon={
                downloaded
                  ? { name: 'delete', type: 'material-community', color: 'red' }
                  : { name: 'download', type: 'feather', color: (!buy && episodeIndex > 2) || (!buy && i > 0) ? 'gray' : 'white' }
                }
              containerStyle={{ backgroundColor: '#33425a' }}
              underlayColor="#2a3545"
              onPressRightIcon={() => {
                if (!isConnected) {
                  return Alert.alert('No internet connection');
                }
                if ((!buy && episodeIndex > 2) || (!buy && i > 0)) {
                  return Alert.alert('Item not purchased');
                }
                this.onEpisodeClick(
                  uid,
                  totalTime,
                  workoutTime,
                  videoSize,
                  (episodeIndex + minIndex),
                  downloaded,
                  true,
                );
              }
              }
              onPress={() => {
                if (!isConnected) {
                  return Alert.alert('No internet connection');
                }
                if ((!buy && episodeIndex > 2) || (!buy && i > 0)) {
                  return Alert.alert('Item not purchased');
                }
                this.onEpisodeClick(
                  uid,
                  totalTime,
                  workoutTime,
                  videoSize,
                  (episodeIndex + minIndex),
                  downloaded,
                );
              }}
            />
          );
        });
      return (
        <View>
          <View style={styles.episodeHeaderView}>
            <Text style={styles.textStyle}>
              {`Part ${i + 1} (Episodes ${minIndex}-${maxIndex})`}
            </Text>
            <View>
              {
                buy
                  ? (
                    <Button
                      title="Purchased"
                      buttonStyle={styles.purchaseButtonStyle}
                      onPress={() => {
                        if (!this.state.isConnected) {
                          return Alert.alert('No internet connection');
                        }
                      }}
                    />)
                  : (
                    <Button
                      title={`£${value.price} (Buy)`}
                      buttonStyle={styles.priceButtonStyle}
                      onPress={() => {
                        if (!this.state.isConnected) {
                          return Alert.alert('No internet connection');
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
      isConnected, lastPlayedEpisode, completeEpisodes, series, loading,
    } = this.state;
    if (loading) return <LoadScreen />;
    return (
      <View style={styles.mainContainer}>
        <StatusBar
          backgroundColor="#00000b"
        />
        <Download ref={ref => (this.child = ref)} />
        { !isConnected ? <OfflineMsg /> : null }
        <ScrollView>
          <View>
            <Image
              style={styles.imageStyle}
              resizeMode="cover"
              resizeMethod="resize"
              source={homeCover}
            />
            <TouchableOpacity onPress={() => {
              if (!isConnected) {
                return Alert.alert('No internet connection');
              }
              const id = lastPlayedEpisode === ''
                ? ((Object.values(((Object.values(series))[0]).episodes))[0]).uid
                : lastPlayedEpisode.episodeId;
              const {
                totalTime, workoutTime, videoSize,
              } = completeEpisodes[id];
              this.onEpisodeClick(
                id,
                totalTime,
                workoutTime,
                videoSize,
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
                          ? homeCover
                          : (
                            lastPlayedEpisode.category === 'Speed'
                              ? speedImage 
                              : (
                                lastPlayedEpisode.category === 'Strength'
                                  ? strengthImage
                                  : controlImage
                                )
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
                          : 'Last Played Episode'
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
                          ? ((Object.values(((Object.values(series))[0]).episodes))[0]).title
                          : lastPlayedEpisode.episodeTitle
                      }
                    </Text>
                  </View>
                </View>
                <Icon style={{ alignSelf: 'flex-end' }} name="chevron-thin-right" type="entypo" color="#f5cb23" />
              </View>
            </TouchableOpacity>
            {this.renderList()}
          </View>
        </ScrollView>
      </View>
    );
  }
}
