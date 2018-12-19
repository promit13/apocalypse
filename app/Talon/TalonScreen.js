import React from 'react';
import {
  ScrollView, View, Image, TouchableOpacity, StatusBar,
  AsyncStorage, Alert, Dimensions,
} from 'react-native';
import { Text, ListItem, Icon } from 'react-native-elements';
import ProgressBarAnimated from 'react-native-progress-bar-animated';
import * as Animatable from 'react-native-animatable';
import firebase from '../config/firebase';
import Loading from '../common/Loading';
import OfflineMsg from '../common/OfflineMsg';
import ShowModal from '../common/ShowModal';

const runningMan = require('../../img/running-man.png');
const talonRoute = require('../../img/talon-route.jpg');
const talonRouteSecond = require('../../img/talon-route-2.jpg');

const barWidth = Dimensions.get('screen').width - 30;
const progressCustomStyles = {
  backgroundColor: 'red',
  borderRadius: 5,
  backgroundColorOnComplete: 'green',
};

const styles = {
  mainContainer: {
    flex: 1,
    backgroundColor: '#001331',
  },
  imageStyle: {
    width: '100%',
    height: 200,
  },
  textStyle: {
    color: 'white',
    fontSize: 14,
  },
  latestIntelView: {
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
const talonImage = require('../../img/talondark.png');
const speedImage = require('../../img/speed.png');
const strengthImage = require('../../img/strength.png');
const controlImage = require('../../img/control.png');
const speedImageGray = require('../../img/speedgray.png');
const strengthImageGray = require('../../img/strengthgray.png');
const controlImageGray = require('../../img/controlgray.png');
const talonCover = require('../../img/taloncover.jpg');

export default class TalonScreen extends React.Component {
  static navigationOptions = {
    title: 'TALON',
  };

  state = {
    talonLogs: '',
    index: 0,
    loading: true,
    lastIntel: '',
    showTalon: false,
    isConnected: true,
    showModal: false,
    modalText: '',
    modalTitle: '',
    lastPlayedEpisode: '',
    series: '',
    playedIntelArray: [],
  };

  componentDidMount = async () => {
    const { netInfo } = this.props.screenProps;
    console.log(netInfo);
    this.setState({ isConnected: netInfo });
    if (!netInfo) {
      const offlineData = await AsyncStorage.getItem('talonLogs');
      const jsonObjectData = JSON.parse(offlineData);
      const {
        talonLogs, lastPlayedEpisode, series,
      } = jsonObjectData;
      return this.setState({
        loading: false, talonLogs, lastPlayedEpisode, series,
      });
    }
    firebase.database().ref('series').on('value', (snapSeries) => {
      firebase.database().ref(`logs/${this.props.screenProps.user.uid}`).on('value', (snapshot) => {
        firebase.database().ref(`users/${this.props.screenProps.user.uid}`).on('value', (snap) => {
          // if (snap.val() === null) {
          //   return;
          // }
          // let playedIntelArray = [];
          // const playedIntel = await AsyncStorage.getItem('playedIntelArray');
          // if (playedIntel !== null) {
          //   playedIntelArray = JSON.parse(playedIntel);
          // }
          const series = Object.values(snapSeries.val());
          const sortedSeries = series.sort((a, b) => parseInt(a.position, 10) - parseInt(b.position, 10));

          const { lastPlayedEpisode, playedIntelArray } = snap.val();
          console.log(playedIntelArray);
          this.setState({
            talonLogs: snapshot.val(),
            lastPlayedEpisode,
            loading: false,
            series: sortedSeries,
            playedIntelArray: Object.values(playedIntelArray),
          });
          AsyncStorage.setItem('talonLogs', JSON.stringify({
            talonLogs: snapshot.val(),
            lastPlayedEpisode,
            series: sortedSeries,
            playedIntelArray: Object.values(playedIntelArray),
          }));
          console.log(this.state.lastIntel);
        });
      });
    });
  }

  renderContent = (i, episodeId, logs, category) => {
    const { index, showTalon, talonLogs } = this.state;
    if (talonLogs === null) {
      return console.log('TALONG LOGS');
    }
    if (index === i && logs !== null && showTalon) {
      // const logsArray = Object.values(talonLogs);
      const logsArray = talonLogs[episodeId];
      const array = Object.values(logsArray);
      const { workOutCompleted } = array[array.length - 1];
      if (category !== 'Speed') {
        return this.navigateToTalonIntelPlayer(episodeId, false, workOutCompleted);
      }
      return (
        <View style={{ backgroundColor: '#445878' }}>
          <TouchableOpacity onPress={() => {
            this.navigateToTalonIntelPlayer(episodeId, false, workOutCompleted);
          }}
          >
            <View style={{
              flexDirection: 'row', padding: 16, justifyContent: 'space-between', borderWidth: 1, borderColor: 'gray',
            }}
            >
              <Text style={styles.textStyle}>
                {
                  workOutCompleted
                    ? `Episode ${i} Intel`
                    : 'Run logs'
                }
                {/* {`${Object.values(logsArray[i - 1])[0]} Intel`} */}
                {/* {`Episode ${i} Intel`} */}
              </Text>
              {
                workOutCompleted
                  ? (
                    <Icon name="chevron-right" type="feather" color="white" />
                  )
                  : null
              }
            </View>
          </TouchableOpacity>
          {
            Object.entries(logsArray).map(([key, value], ind) => {
              const {
                dateNow, timeInterval, distance, steps, trackingStarted, category, workOutCompleted,
              } = value;
              if (!trackingStarted || category !== 'Speed') {
                return console.log(trackingStarted);
              }
              const progressPercentage = ((distance / 2) * 100) > 100 ? 100 : (distance / 2) * 100;
              const date = new Date(dateNow);
              const formatDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
              return (
                <ListItem
                  title={`${formatDate} - ${distance} km (${steps} steps) in ${timeInterval} mins`}
                  titleStyle={styles.textStyle}
                  key={key}
                  subtitle={
                    (
                      <View>
                        <Image
                          source={i === 1 ? talonRoute : talonRouteSecond}
                          style={[styles.imageStyle, { height: 80, marginTop: 10, marginBottom: 10 }]}
                          resizeMethod="resize"
                        />
                        <Image
                          style={{
                            height: 30,
                            width: 30,
                            marginBottom: -15,
                            marginLeft: (progressPercentage <= 0 ? 0 : ((progressPercentage - 10) / 100) * barWidth),
                          }}
                          animation="fadeInLeft"
                          source={runningMan}
                        />
                        <ProgressBarAnimated
                          width={barWidth}
                          {...progressCustomStyles}
                          value={progressPercentage}
                          barAnimationDuration={500}
                        />
                      </View>
                    )
                  }
                  containerStyle={{ marginLeft: 10, marginRight: 10 }}
                  hideChevron
                />
              );
              // }
            })
          }
        </View>
      );
    }
  }

  navigateToTalonIntelPlayer = (episodeId, lastPlayBar, workOutCompleted) => {
    const { playedIntelArray, isConnected, lastPlayedEpisode } = this.state;
    if (!isConnected) {
      return this.setState({ modalTitle: 'Please check your internet connection', showModal: true });
    }
    if (lastPlayBar) {
      if (lastPlayedEpisode === '' || playedIntelArray.length === 0) {
        return this.setState({ modalText: 'Complete Episode 1 to unlock your first intel', modalTitle: 'No intel available', showModal: true });
      }
    }
    if (!workOutCompleted) {
      return this.setState({ modalTitle: 'You must complete workout to access intel', showModal: true });
    }
    const { uid } = this.props.screenProps.user;
    console.log(playedIntelArray);
    const played = playedIntelArray.some((el) => {
      return el.episodeId === episodeId;
    });
    if (!played) {
      firebase.database().ref(`users/${uid}/playedIntelArray`).push(
        {
          episodeId,
        },
      );
    }
    this.props.navigation.navigate('TalonIntelPlayer', {
      episodeId,
      talon: true,
      mode: 'TALON Intel Player',
      uid,
      navigateBack: 'TalonScreen',
    });
  }

  render() {
    // if (this.state.talonLogs === null) {
    //   return (
    //     <View style={[styles.mainContainer, { justifyContent: 'center', alignItems: 'center' }]}>
    //       <Text style={[styles.textStyle, { fontSize: 16 }]}>
    //         Sorry you have no any logged talon.
    //       </Text>
    //     </View>
    //   );
    // }

    const {
      modalText, series, lastPlayedEpisode, talonLogs, playedIntelArray, isConnected, loading, showModal, modalTitle,
    } = this.state;
    let talonKeyArray = [];
    if (talonLogs !== '' && talonLogs !== null) {
      talonKeyArray = Object.keys(talonLogs);
    }
    const alreadyPlayed = lastPlayedEpisode !== '' ? playedIntelArray.some((el) => {
      return el.episodeId === lastPlayedEpisode.episodeId;
    }) : null;
    console.log(alreadyPlayed);
    console.log(playedIntelArray.length);
    const { episodeId, episodeTitle } = lastPlayedEpisode;
    const episodes = Object.entries(series).map(([seriesKey, value], index) => {
      if (value.episodes === undefined) {
        return console.log('no episodes added');
      }
      const episodesList = Object.entries(value.episodes)
        .map(([episodeKey, episodeValue], i) => {
          const { uid, category } = episodeValue;
          const talonDone = talonKeyArray.includes(uid);

          const logsArray = talonDone ? (Object.values(talonLogs[uid])) : [{ workOutCompleted: false }];
          console.log(logsArray);
          const { workOutCompleted } = (logsArray[logsArray.length - 1]);
          const talonArrayLength = talonDone ? logsArray.length : 1;
          return (
            <View>
              <ListItem
                key={episodeKey}
                roundAvatar
                avatar={
                  category === 'Speed' && talonDone && (talonArrayLength > 1)
                    ? speedImage
                    : (
                      category === 'Speed' && !talonDone
                        ? speedImageGray
                        : (
                          category === 'Strength' && talonDone && (talonArrayLength > 1) && workOutCompleted
                            ? strengthImage
                            : (
                              category === 'Strength' && !talonDone
                                ? strengthImageGray
                                : (
                                  category === 'Control' && talonDone && (talonArrayLength > 1) && workOutCompleted
                                    ? controlImage
                                    : controlImageGray
                                )
                            )
                        )
                    )
                }
                title={ talonDone ? `Episode ${i + 1} Intel File` : 'No Essential Intel Available'}
                titleStyle={{
                  color:
                    category !== 'Speed' && talonDone && (talonArrayLength > 1) && workOutCompleted
                      ? 'white'
                      : (
                        category === 'Speed' && talonDone && (talonArrayLength > 1)
                          ? 'white'
                          : 'gray'
                      ),
                  fontWeight: 'bold',
                }}
                rightIcon={{
                  name: 'chevron-down',
                  type: 'feather',
                  color:
                    category !== 'Speed' && talonDone && (talonArrayLength > 1) && workOutCompleted
                      ? '#f5cb23'
                      : (
                        category === 'Speed' && talonDone && (talonArrayLength > 1)
                          ? '#f5cb23'
                          : 'gray'
                      ),
                }}
                containerStyle={{ backgroundColor: '#33425a' }}
                underlayColor="#2a3545"
                onPress={() => {
                  if (category === 'Speed' && (!talonDone || (talonArrayLength === 1))) {
                    return;
                  }
                  if (category !== 'Speed' && (!talonDone || (talonArrayLength === 1) || !workOutCompleted)) {
                    return;
                  }
                  this.setState({ index: i + 1, showTalon: !this.state.showTalon });
                }}
              />
              {this.renderContent((i + 1), uid, episodeValue, category)}
            </View>
          );
        });
      return episodesList;
    });
    return (
      <View style={styles.mainContainer}>
        <StatusBar
          backgroundColor="#00000b"
        />
        {!isConnected ? <OfflineMsg /> : null}
        {loading
          ? <Loading />
          : (
            <ScrollView>
              <Image
                style={styles.imageStyle}
                resizeMethod="resize"
                source={talonCover}
              />
              <TouchableOpacity onPress={() => {
                // const episodeId = (Object.keys(this.state.talonLogs))[0];
                this.navigateToTalonIntelPlayer(episodeId, true, true);
              }}
              >
                <View style={styles.latestIntelView}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Image style={{ height: 60, width: 60 }} source={talonImage} resizeMethod="resize" />
                    <View>
                      <Text
                        style={{
                          color: '#001331',
                          fontSize: 20,
                          fontWeight: 'bold',
                          marginLeft: 10,
                          marginRight: 10,
                        }}
                      >
                        {lastPlayedEpisode === '' || playedIntelArray.length === 0
                          ? 'No Essential Intel Available'
                          : (
                            alreadyPlayed
                              ? 'Play Latest Essential Intel'
                              : 'Play New Essential Intel'
                          )
                        }
                      </Text>
                      <Text style={{
                        fontSize: 16,
                        color: '#001331',
                        marginLeft: 10,
                        marginRight: 10,
                        fontWeight: 'bold',
                      }}
                      >
                        {/* {`${Object.values(Object.values(this.state.talonLogs)[0])[0].episodeTitle}`} */}
                        {lastPlayedEpisode === '' || playedIntelArray.length === 0
                          ? 'Play Ep 1 to unlock your intel'
                          : `${episodeTitle}`
                        }
                      </Text>
                    </View>
                  </View>
                  <Icon style={{ alignSelf: 'flex-end' }} name="chevron-thin-right" type="entypo" color={lastPlayedEpisode === '' ? 'gray' : '#f5cb23'} />
                </View>
              </TouchableOpacity>
              <ShowModal
                visible={showModal}
                title={modalTitle}
                description={modalText}
                buttonText="Got it"
                onPress={() => {
                  this.setState({ showModal: false });
                }}
              />
              {episodes}
            </ScrollView>
          )
        }
      </View>
    );
  }
}
