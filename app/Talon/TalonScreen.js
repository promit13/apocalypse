import React from 'react';
import {
  ScrollView, View, Image, TouchableOpacity, StatusBar,
  AsyncStorage, Alert, Dimensions, TouchableHighlight,
} from 'react-native';
import { Text, ListItem, Icon } from 'react-native-elements';
import { scale, moderateScale } from 'react-native-size-matters';
import * as Progress from 'react-native-progress';
import firebase from '../config/firebase';
import Loading from '../common/Loading';
import LoadScreen from '../common/LoadScreen';
import OfflineMsg from '../common/OfflineMsg';
import ShowModal from '../common/ShowModal';

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
    fontSize: moderateScale(14),
  },
  latestIntelView: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: moderateScale(10),
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
const runningMan = require('../../img/running-man.png');
const talonRoute = require('../../img/talon-route-base.jpg');
const talonRouteSecond = require('../../img/talon-route-museum.jpg');

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
    pressStatus: false,
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
        firebase.database().ref(`userDatas/${this.props.screenProps.user.uid}`).on('value', (snap) => {
          let loggedLastPlayedEpisode = '';
          let loggedPlayedIntelArray = '';
          let loggedDistanceUnit = false;
          if (snap.val() !== null) {
            const { lastPlayedEpisode, playedIntelArray, unit } = snap.val();
            if (lastPlayedEpisode !== undefined) {
              loggedLastPlayedEpisode = lastPlayedEpisode;
            }
            if (playedIntelArray !== undefined) {
              loggedPlayedIntelArray = playedIntelArray;
            }
            if (unit !== undefined) {
              loggedDistanceUnit = unit.distanceUnit;
            }
          }
          // let playedIntelArray = [];
          // const playedIntel = await AsyncStorage.getItem('playedIntelArray');
          // if (playedIntel !== null) {
          //   playedIntelArray = JSON.parse(playedIntel);
          // }
          const series = Object.values(snapSeries.val());
          const sortedSeries = series.sort((a, b) => parseInt(a.position, 10) - parseInt(b.position, 10));

          // const { lastPlayedEpisode, playedIntelArray, distanceUnit } = snap.val();
          // console.log(playedIntelArray);
          this.setState({
            talonLogs: snapshot.val(),
            lastPlayedEpisode: loggedLastPlayedEpisode,
            loading: false,
            series: sortedSeries,
            distanceUnit: loggedDistanceUnit,
            playedIntelArray: Object.values(loggedPlayedIntelArray),
          });
          AsyncStorage.setItem('talonLogs', JSON.stringify({
            talonLogs: snapshot.val(),
            lastPlayedEpisode: loggedLastPlayedEpisode,
            series: sortedSeries,
            distanceUnit: loggedDistanceUnit,
            playedIntelArray: Object.values(loggedPlayedIntelArray),
          }));
          console.log(this.state.lastIntel);
        });
      });
    });
  }

  onHideUnderlay() {
    this.setState({ pressStatus: false });
  }

  onShowUnderlay() {
    this.setState({ pressStatus: true });
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
              flexDirection: 'row', padding: moderateScale(16), justifyContent: 'space-between', borderWidth: 1, borderColor: 'gray',
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
          <View style={{ backgroundColor: 'white', paddingLeft: moderateScale(10), paddingRight: moderateScale(10) }}>
            <Image
              source={i === 1 ? talonRoute : talonRouteSecond}
              style={[styles.imageStyle, { height: moderateScale(100) }]}
              resizeMode="contain"
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
                    containerStyle={{ marginLeft: moderateScale(10), marginRight: moderateScale(10) }}
                    hideChevron
                  />
                  <View style={{ backgroundColor: 'white', paddingBottom: moderateScale(5), paddingLeft: moderateScale(15), paddingRight: moderateScale(15) }}>
                    {/* marginLeft: (progressPercentage <= 0 ? 0 : ((progressPercentage - 10) / 100) * barWidth) */}
                    <Image
                      style={{
                        height: moderateScale(25),
                        width: moderateScale(25),
                        marginBottom: moderateScale(-3),
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
      firebase.database().ref(`userDatas/${uid}/playedIntelArray`).push(
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
      series, lastPlayedEpisode, talonLogs, playedIntelArray, isConnected, loading, showModal, modalTitle, pressStatus,
    } = this.state;
    console.log(pressStatus);
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
                  fontSize: moderateScale(18),
                  marginLeft: moderateScale(10),
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
          ? <LoadScreen />
          : (
            <ScrollView>
              <Image
                style={styles.imageStyle}
                resizeMethod="resize"
                source={talonCover}
              />
              <TouchableHighlight
                underlayColor="black"
                activeOpacity={0.6}
                onHideUnderlay={() => this.onHideUnderlay()}
                onShowUnderlay={() => this.onShowUnderlay()}
                onPress={() => {
                // const episodeId = (Object.keys(this.state.talonLogs))[0];
                  if (talonLogs === null || lastPlayedEpisode === '') {
                    return this.setState({ modalTitle: 'Complete Episode 1 to unlock your first intel', showModal: true });
                  }
                  const logsArrayLastEpisode = Object.values(talonLogs[episodeId]);
                  const workOutCompletedLastEpisode = (logsArrayLastEpisode[logsArrayLastEpisode.length - 1]).workOutCompleted;
                  this.navigateToTalonIntelPlayer(episodeId, true, workOutCompletedLastEpisode);
                }}
              >
                <View style={styles.latestIntelView}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Image style={{ height: moderateScale(50), width: moderateScale(50) }} source={talonImage} resizeMethod="resize" />
                    <View>
                      <Text
                        style={{
                          color: pressStatus ? 'white' : '#001331',
                          fontSize: moderateScale(18),
                          fontWeight: 'bold',
                          marginLeft: moderateScale(10),
                          marginRight: moderateScale(10),
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
                        fontSize: moderateScale(16),
                        color: '#001331',
                        marginLeft: moderateScale(10),
                        marginRight: moderateScale(10),
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
                  <Icon style={{ alignSelf: 'flex-end' }} name="chevron-thin-right" type="entypo" color={lastPlayedEpisode === '' ? 'gray' : '#f5cb23'} size={moderateScale(25)} />
                </View>
              </TouchableHighlight>
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
