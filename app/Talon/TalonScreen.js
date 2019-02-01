import React from 'react';
import {
  ScrollView, View, Image, TouchableOpacity, StatusBar,
  AsyncStorage, Alert, Dimensions,
} from 'react-native';
import { Text, ListItem, Icon } from 'react-native-elements';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import * as Progress from 'react-native-progress';
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
    height: scale(200),
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
    modalTitle: '',
    lastPlayedEpisode: '',
    series: '',
    playedIntelArray: [],
    distanceUnit: false,
  };

  componentDidMount = async () => {
    const { netInfo } = this.props.screenProps;
    console.log(netInfo);
    this.setState({ isConnected: netInfo });
    if (!netInfo) {
      const offlineData = await AsyncStorage.getItem('talonLogs');
      const jsonObjectData = JSON.parse(offlineData);
      const {
        talonLogs, lastPlayedEpisode, series, distanceUnit,
      } = jsonObjectData;
      return this.setState({
        loading: false, talonLogs, lastPlayedEpisode, series, distanceUnit,
      });
    }
    firebase.database().ref('series').on('value', (snapSeries) => {
      firebase.database().ref(`logs/${this.props.screenProps.user.uid}`).on('value', (snapshot) => {
        firebase.database().ref(`users/${this.props.screenProps.user.uid}`).on('value', (snap) => {
          if (snap.val() === null) {
            return;
          }
          // let playedIntelArray = [];
          // const playedIntel = await AsyncStorage.getItem('playedIntelArray');
          // if (playedIntel !== null) {
          //   playedIntelArray = JSON.parse(playedIntel);
          // }
          const series = Object.values(snapSeries.val());
          const sortedSeries = series.sort((a, b) => parseInt(a.position, 10) - parseInt(b.position, 10));

          const { lastPlayedEpisode, playedIntelArray, distanceUnit } = snap.val();
          console.log(playedIntelArray);
          this.setState({
            talonLogs: snapshot.val(),
            lastPlayedEpisode,
            loading: false,
            series: sortedSeries,
            distanceUnit,
            playedIntelArray: Object.values(playedIntelArray),
          });
          AsyncStorage.setItem('talonLogs', JSON.stringify({
            talonLogs: snapshot.val(),
            lastPlayedEpisode,
            series: sortedSeries,
            distanceUnit,
            playedIntelArray: Object.values(playedIntelArray),
          }));
          console.log(this.state.lastIntel);
        });
      });
    });
  }

  renderContent = (i, episodeId, logs, category) => {
    const { index, showTalon, talonLogs, distanceUnit } = this.state;
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
          <View style={{ backgroundColor: 'white', paddingBottom: 5, paddingLeft: 15, paddingRight: 15 }}>
            <Image
              source={i === 1 ? talonRoute : talonRouteSecond}
              style={[styles.imageStyle, { height: 80, marginTop: 10, marginBottom: 10 }]}
              resizeMethod="resize"
            />
          </View>
          {
            Object.entries(logsArray).map(([key, value], ind) => {
              const {
                dateNow, timeInterval, distance, steps, trackingStarted,
              } = value;
              if (!trackingStarted || category !== 'Speed') {
                return console.log(trackingStarted);
              }
              // const progressPercentage = ((distance / 2) * 100) > 100 ? 100 : (distance / 2) * 100;
              const date = new Date(dateNow);
              const formatDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
              const unit = distanceUnit ? 'miles' : 'km';
              const convertedDistance = distanceUnit ? (distance / 1609.34).toFixed(2) : (distance / 1000).toFixed(2);
              const progressPercentage = (convertedDistance / 5) > 1 ? 1 : (convertedDistance / 5);
              return (
                <View>
                  <ListItem
                    title={`${formatDate} - ${convertedDistance} ${unit} (${steps} steps) in ${timeInterval} mins`}
                    titleStyle={styles.textStyle}
                    key={key}
                    containerStyle={{ marginLeft: 10, marginRight: 10 }}
                    hideChevron
                  />
                  <View style={{ backgroundColor: 'white', paddingBottom: 5, paddingLeft: 15, paddingRight: 15 }}>
                    {/* marginLeft: (progressPercentage <= 0 ? 0 : ((progressPercentage - 10) / 100) * barWidth) */}
                    <Image
                      style={{
                        height: 25,
                        width: 25,
                        marginBottom: -3,
                        marginLeft: (progressPercentage <= 0 ? 0 : (progressPercentage - 0.05) * barWidth),
                      }}
                      animation="fadeInLeft"
                      source={runningMan}
                    />
                    {/* <ProgressBarAnimated
                      width={barWidth}
                      {...progressCustomStyles}
                      value={progressPercentage}
                      barAnimationDuration={500}
                    /> */}
                    <Progress.Bar progress={progressPercentage} width={barWidth} color="green" />
                  </View>
                </View>
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
    const { netInfo } = this.props.screenProps;
    if (!netInfo) {
      return this.setState({ modalTitle: 'Please check your internet connection', showModal: true });
    }
    if (lastPlayBar) {
      if (lastPlayedEpisode === '') {
        return this.setState({ modalTitle: 'Complete Episode 1 to unlock your first intel', showModal: true });
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
      series, lastPlayedEpisode, talonLogs, playedIntelArray, isConnected, loading, showModal, modalTitle,
    } = this.state;
    const { netInfo } = this.props.screenProps;
    let talonKeyArray = [];
    if (talonLogs !== '' && talonLogs !== null) {
      talonKeyArray = Object.keys(talonLogs);
    }
    const alreadyPlayed = lastPlayedEpisode !== '' ? playedIntelArray.some((el) => {
      return el.episodeId === lastPlayedEpisode.episodeId;
    }) : null;
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
          const { workOutCompleted } = (logsArray[logsArray.length - 1]);
          const talonArrayLength = talonDone ? logsArray.length : 1;
          return (
            <View>
              <ListItem
                key={episodeKey}
                roundAvatar
                avatar={
                  category === 'Speed' && workOutCompleted && (talonArrayLength > 1)
                    ? speedImage
                    : (
                      category === 'Speed' && !workOutCompleted
                        ? speedImageGray
                        : (
                          category === 'Strength' && (talonArrayLength > 1) && workOutCompleted
                            ? strengthImage
                            : (
                              category === 'Strength' && !workOutCompleted
                                ? strengthImageGray
                                : (
                                  category === 'Control' && (talonArrayLength > 1) && workOutCompleted
                                    ? controlImage
                                    : controlImageGray
                                )
                            )
                        )
                    )
                }
                title={workOutCompleted ? `Episode ${i + 1} Intel File` : 'No Essential Intel Available'}
                titleStyle={{
                  color:
                   (talonArrayLength > 1) && workOutCompleted
                     ? 'white'
                     : 'gray',
                  fontWeight: 'bold',
                }}
                rightIcon={{
                  name: category !== 'Speed' ? 'chevron-right' : 'chevron-down',
                  type: 'feather',
                  color:
                     (talonArrayLength > 1) && workOutCompleted
                       ? '#f5cb23'
                       : 'gray',
                }}
                containerStyle={{ backgroundColor: '#33425a' }}
                underlayColor="#2a3545"
                onPress={() => {
                  if (category === 'Speed' && (!workOutCompleted || (talonArrayLength === 1))) {
                    return;
                  }
                  if (category !== 'Speed' && ((talonArrayLength === 1) || !workOutCompleted)) {
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
        {!netInfo ? <OfflineMsg /> : null}
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
                const logsArrayLastEpisode = Object.values(talonLogs[episodeId]);
                const workOutCompletedLastEpisode = (logsArrayLastEpisode[logsArrayLastEpisode.length - 1]).workOutCompleted;
                this.navigateToTalonIntelPlayer(episodeId, true, workOutCompletedLastEpisode);
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
                        {lastPlayedEpisode === ''
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
                        {lastPlayedEpisode === ''
                          ? null
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
