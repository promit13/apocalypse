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
import LoadScreen from '../LoadScreen';
import OfflineMsg from '../common/OfflineMsg';

const homeCover = require('../../img/homecover.jpg');
const speedImage = require('../../img/speed.png');
const strengthImage = require('../../img/strength.png');
const controlImage = require('../../img/control.png');

const styles = {
  imageStyle: {
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

export default class EpisodeList extends React.Component {
  static navigationOptions = {
    title: 'Home',
  };

  state = {
    series: '',
    loading: true,
    purchasedSeries: [],
    lastPlayedEpisode: '',
    isConnected: true,
  }

  componentDidMount= async () => {
    const { netInfo } = this.props.screenProps;
    this.setState({ isConnected: netInfo });
    try {
      if (!netInfo) {
        const offlineData = await AsyncStorage.getItem('series');
        // const series = await AsyncStorage.getItem('series);
        // const purchasedSeries = await AsyncStorage.getItem('purchasedSeries');
        // return this.setState({ loading: false, series: JSON.parse(series), purchasedSeries: JSON.parse(purchasedSeries) });
        const jsonObjectData = JSON.parse(offlineData);
        const { series, purchasedSeries, lastPlayedEpisode } = jsonObjectData;
        return this.setState({
          loading: false, series, purchasedSeries, lastPlayedEpisode,
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
          const purchasedSeries = Object.entries(purchases).map(([key, value], i) => {
            return value.seriesId;
          });
          this.setState({
            series: snapshot.val(), lastPlayedEpisode, purchasedSeries, loading: false,
          });
          // AsyncStorage.setItem('series', JSON.stringify(snapshot.val())).then(() => {
          //   AsyncStorage.setItem('purchasedSeries', JSON.stringify(purchasedSeries));
          // });
          AsyncStorage.setItem('series', JSON.stringify({
            series: snapshot.val(),
            purchasedSeries,
            lastPlayedEpisode,
          })).then(() => {

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

  onEpisodeClick = (episodeId, index, download) => {
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
        // return this.donwloadFile(title, video);
        return this.props.navigation.navigate('DownloadFiles', {
          episodeId,
          episodeTitle: title,
          category,
          description,
          exercises,
          video,
        });
        // return (
        //   <DownloadFiles
        //     episodeTitle={title}
        //     episodeId={episodeId}
        //     category={category}
        //     description={description}
        //     exercises={exercises}
        //     video={video}
        //   />
        // );
      }
      this.props.navigation.navigate('EpisodeView', {
        episodeId,
        title,
        category,
        description,
        exercises,
        video,
        index,
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
        date: new Date(),
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

  renderList = () => {
    let minIndex = 0;
    let maxIndex = 0;
    const seriesList = Object.entries(this.state.series).map(([key, value], i) => {
      const buy = this.state.purchasedSeries.includes(key);
      minIndex = maxIndex + 1;
      maxIndex += Object.keys(value.episodes).length; // value.episodes.length ;
      const episodesList = Object.entries(value.episodes)
        .map(([episodeKey, episodeValue], episodeIndex) => {
          const { uid, title, category } = episodeValue;
          return (
            <ListItem
              key={episodeKey}
              title={`${episodeIndex + minIndex}. ${title}`}
              subtitle={category}
              titleStyle={{ color: buy ? 'white' : 'gray', fontSize: 18 }}
              subtitleStyle={{ color: buy ? 'white' : 'gray' }}
              rightIcon={{ name: 'download', type: 'feather', color: buy ? 'white' : 'gray' }}
              containerStyle={{ backgroundColor: buy ? '#33425a' : '#2a3545' }}
              underlayColor="#2a3545"
              onPressRightIcon={() => {
                if (!this.state.isConnected) {
                  return Alert.alert('No internet connection');
                }
                if (!buy) {
                  return Alert.alert('Item not purchased');
                }
                this.onEpisodeClick(
                  uid,
                  (episodeIndex + minIndex),
                  true,
                );
              }
              }
              onPress={() => {
                if (!this.state.isConnected) {
                  return Alert.alert('No internet connection');
                }
                if (!buy) {
                  return Alert.alert('Item not purchased');
                }
                this.onEpisodeClick(
                  uid,
                  (episodeIndex + minIndex),
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
                        const purchaseId = Platform.OS === 'android' ? value.googleID : value.iosID;
                        firebase.database().ref(`users/${this.props.screenProps.user.uid}/purchases`).push({
                          inAppPurchaseId: purchaseId,
                          seriesId: key,
                          price: value.price,
                          date: new Date(),
                          transactionReceipt: 'asdfasdf',
                          purchaseToken: 'asdfasdf',
                        });
                        // if (!this.state.isConnected) {
                        //   return Alert.alert('No internet connection');
                        // }
                        // const purchaseId = Platform.OS === 'android' ? value.googleID : value.iosID;
                        // this.buyItem(key, purchaseId, value.price);
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
    const { isConnected, lastPlayedEpisode } = this.state;
    if (this.state.loading) return <LoadScreen />;
    return (
      <View style={{ flex: 1, backgroundColor: '#001331' }}>
        <StatusBar
          backgroundColor="#00000b"
        />
        <ScrollView>
          <View>
            <Image
              style={styles.imageStyle}
              resizeMethod="resize"
              source={homeCover}
            />
            <TouchableOpacity onPress={() => {
              if (!isConnected) {
                return Alert.alert('No internet connection');
              }
              if (lastPlayedEpisode === '') {
                return Alert.alert('No episode played yet.');
              }
              this.onEpisodeClick(lastPlayedEpisode.episodeId);
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
                      Last Played Episode
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
                          ? 'No episode played'
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
