import React from 'react';
import {
  ScrollView, View, Image, TouchableOpacity, Platform, StatusBar, Alert, PermissionsAndroid, AsyncStorage,
} from 'react-native';
import {
  Text, ListItem, Icon, Button,
} from 'react-native-elements';
import * as RNIap from 'react-native-iap';
import RNFetchBlob from 'react-native-fetch-blob';
import firebase from '../config/firebase';
import LoadScreen from '../LoadScreen';
import OfflineMsg from '../common/OfflineMsg';

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
const homeCover = require('../../img/homecover.jpg');

export default class EpisodeList extends React.Component {
  static navigationOptions = {
    title: 'Home',
  };

  state = {
    series: '',
    loading: true,
    purchasedSeries: [],
  }

  componentWillMount() {
    this.setState({ isConnected: this.props.screenProps.netInfo });
  }

  componentDidMount= async () => {
    try {
      if (!this.state.isConnected) {
        const series = await AsyncStorage.getItem('series');
        const purchasedSeries = await AsyncStorage.getItem('purchasedSeries');
        return this.setState({ loading: false, series: JSON.parse(series), purchasedSeries: JSON.parse(purchasedSeries) });
      }
      // await RNIap.initConnection();
      this.requestPermissions();
      firebase.database().ref(`users/${this.props.screenProps.user.uid}/purchases`).on('value', (snap) => {
        if (snap.val() === null) {
          return;
        }
        firebase.database().ref('series').on('value', (snapshot) => {
          const purchasedSeries = Object.entries(snap.val()).map(([key, value], i) => {
            return value.seriesId;
          });
          this.setState({ series: snapshot.val(), purchasedSeries, loading: false });
          AsyncStorage.setItem('series', JSON.stringify(snapshot.val())).then(() => {
            AsyncStorage.setItem('purchasedSeries', JSON.stringify(purchasedSeries));
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

  onEpisodeClick = (episodeId, index, seriesImageUrl, download) => {
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
        seriesImageUrl,
      });
    });
  }

  requestPermissions = async () => {
    try {
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
    } catch (err) {
      console.log(err);
    }
  }

  buyItem = async (item, itemId, itemPrice) => {
    try {
      console.log('buyItem: ', item);
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
    }
  }

  // donwloadFile = (fileTitle, downloadUrl) => {
  //   const { dirs } = RNFetchBlob.fs;
  //   RNFetchBlob.fs.mkdir(`${dirs.MovieDir}/AST/${fileTitle}`)
  //     .then(() => {
  //       RNFetchBlob
  //         .config({
  //         // response data will be saved to this path if it has access right.
  //           path: `${dirs.DocumentDir}/AST/${fileTitle}/${fileTitle}.mp4`,
  //         })
  //         // .fetch('GET', `${downloadUrl}`, {
  //         .fetch('GET', 'https://firebasestorage.googleapis.com/v0/b/astraining-95c0a.appspot.com/o/temp%2Fcrowd-cheering.mp3?alt=media&token=def168b4-c566-4555-ab22-a614106298a5', {
  //           // some headers ..
  //         })
  //         .then((res) => {
  //         // the path should be dirs.DocumentDir + 'path-to-file.anything'
  //           console.log('The file saved to ', res.path());
  //         });
  //     });
  // }

  renderList = () => {
    let minIndex = 0;
    let maxIndex = 0;
    const seriesList = Object.entries(this.state.series).map(([key, value], i) => {
      const buy = this.state.purchasedSeries.includes(key);
      minIndex = maxIndex + 1;
      maxIndex += Object.keys(value.episodes).length;
      const episodesList = Object.entries(value.episodes)
        .map(([episodeKey, episodeValue], episodeIndex) => {
          return (
            <ListItem
              key={episodeKey}
              title={`${episodeIndex + minIndex}. ${episodeValue.title}`}
              subtitle={episodeValue.category}
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
                  episodeKey,
                  (episodeIndex + minIndex),
                  value.file,
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
                  episodeKey,
                  episodeIndex,
                  value.file,
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
                        const purchaseId = Platform.OS === 'android' ? value.googleId : value.iosId;
                        this.buyItem(key, purchaseId, value.price);
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
              resizeMode="stretch"
              source={homeCover}
            />
            <TouchableOpacity onPress={() => {}}>
              <View style={styles.playingEpisodeView}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={styles.circularImageView}>
                    <Image
                      style={{
                        height: 60,
                        width: 60,
                        borderRadius: 60 / 2,
                      }}
                      source={{ uri: 'https://firebasestorage.googleapis.com/v0/b/astraining-95c0a.appspot.com/o/temp%2FHome.jpg?alt=media&token=8c4beb9d-d6c3-43f7-a5a6-27527fe21029' }}
                    />
                  </View>
                  <View>
                    <Text style={{
                      fontSize: 18,
                      color: '#001331',
                      marginLeft: 10,
                      marginRight: 10,
                    }}
                    >
                      Play First Episode
                    </Text>
                    <Text style={{ color: '#001331', marginLeft: 10, marginRight: 10 }}>
                      Welcome to the Apocalypse
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
