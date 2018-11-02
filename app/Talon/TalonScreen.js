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

const gifImageSource = require('../../img/walk.gif');

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
      lastPlayedEpisode: '',
      series: '',
    };

  componentDidMount = async () => {
    const { netInfo } = this.props.screenProps;
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
          const series = Object.values(snapSeries.val());
          const sortedSeries = series.sort((a, b) => parseInt(a.position, 10) - parseInt(b.position, 10));

          const { lastPlayedEpisode } = snap.val();
          this.setState({
            talonLogs: snapshot.val(),
            lastPlayedEpisode,
            loading: false,
            series: sortedSeries,
          });
          AsyncStorage.setItem('talonLogs', JSON.stringify({
            talonLogs: snapshot.val(),
            lastPlayedEpisode,
            series: sortedSeries,
          }));
          console.log(this.state.lastIntel);
        });
      });
    });
  }

  renderContent = (i, episodeId, logs) => {
    const { index, showTalon } = this.state;
    if (index === i && logs !== null && showTalon) {
      return (
        <View style={{ backgroundColor: '#445878' }}>
          <TouchableOpacity onPress={() => {
            if (!this.state.isConnected) {
              return Alert.alert('No internet connection');
            }
            this.props.navigation.navigate('TalonIntelPlayer', {
              episodeId,
              talon: true,
              mode: 'TALON Intel Player',
            });
          }}
          >
            <View style={{
              flexDirection: 'row', padding: 16, justifyContent: 'space-between', borderWidth: 1, borderColor: 'gray',
            }}
            >
              <Text style={styles.textStyle}>
                {/* {`${Object.values(logs)[0].index} Intel`} */}
                {`Episode ${i} Intel`}
              </Text>
              <Icon name="chevron-right" type="feather" color="white" />
            </View>
          </TouchableOpacity>
          {
            Object.entries(logs).map(([key, value], ind) => {
              if (ind === 0 || !value.workOutCompleted) {
                console.log(value);
              } else {
                const { dateNow, timeInterval, distance, steps } = value;
                const progressPercentage = ((distance / 2) * 100) > 100 ? 100 : (distance / 2) * 100;
                const date = new Date(dateNow);
                const formatDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
                return (
                  <ListItem
                    title={`${formatDate} - ${distance} km (${steps} steps) in ${timeInterval} mins`}
                    titleStyle={styles.textStyle}
                    subtitle={
                      (
                        <View>
                          <Animatable.Image
                            style={{
                              height: 40,
                              width: 40,
                              marginBottom: 5,
                              marginLeft: (progressPercentage <= 0 ? 0 : ((progressPercentage - 10) / 100) * barWidth),
                            }}
                            animation="fadeInLeft"
                            source={gifImageSource}
                          />
                          <ProgressBarAnimated
                            width={barWidth}
                            {...progressCustomStyles}
                            value={progressPercentage}
                            barAnimationDuration={500}
                            onComplete={() => {
                              Alert.alert('Hey!', 'You finished the exercise!');
                            }}
                          />
                        </View>
                      )
                      }
                    containerStyle={{ marginLeft: 10, marginRight: 10 }}
                    hideChevron
                  />
                );
              }
            })
          }
        </View>
      );
    }
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
      series, lastPlayedEpisode, talonLogs,
    } = this.state;
    const talonKeyArray = Object.keys(talonLogs);
    const { episodeId, episodeTitle } = lastPlayedEpisode;
    const episodes = Object.entries(series).map(([seriesKey, value], index) => {
      if (value.episodes === undefined) {
        return console.log('no episodes added');
      }
      const episodesList = Object.entries(value.episodes)
        .map(([episodeKey, episodeValue], i) => {
          const { uid, category } = episodeValue;
          const talonDone = talonKeyArray.includes(uid);
          return (
            <View>
              <ListItem
                key={episodeKey}
                roundAvatar
                avatar={
                  category === 'Speed'
                  ? speedImage
                    : (
                      category === 'Strength'
                        ? strengthImage
                        : controlImage
                  )
                }
                title={`Episode ${i + 1} Intel File`}
                titleStyle={{ color: talonDone ? 'white' : 'gray', fontWeight: 'bold' }}
                rightIcon={{ name: 'chevron-down', type: 'feather', color: talonDone ? '#f5cb23' : 'gray' }}
                containerStyle={{ backgroundColor: '#33425a' }}
                underlayColor="#2a3545"
                onPress={() => {
                  if (!talonDone) {
                    return;
                  }
                  this.setState({ index: i + 1, showTalon: !this.state.showTalon });
                }}
              />
              { this.renderContent((i + 1), uid, episodeValue) }
            </View>
          );
        });
      return episodesList;
    });
    if (this.state.loading) return <Loading />;
    return (
      <View style={styles.mainContainer}>
        <StatusBar
          backgroundColor="#00000b"
        />
        { !this.state.isConnected ? <OfflineMsg /> : null }
        <ScrollView>
          <Image
            style={styles.imageStyle}
            resizeMethod="resize"
            source={talonCover}
          />
          <TouchableOpacity onPress={() => {
            if (!this.state.isConnected) {
              return Alert.alert('No internet connection');
            }
            // const episodeId = (Object.keys(this.state.talonLogs))[0];
            this.props.navigation.navigate('TalonIntelPlayer', {
              episodeId,
              talon: true,
              mode: 'TALON Intel Player',
            });
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
                    { lastPlayedEpisode === ''
                      ? 'No Essential Intel Available'
                      : 'Play Latest Essential Intel'
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
                    { lastPlayedEpisode === ''
                      ? 'Play Ep 1 to unlock your intel'
                      : `${episodeTitle}`
                    }
                  </Text>
                </View>
              </View>
              <Icon style={{ alignSelf: 'flex-end' }} name="chevron-thin-right" type="entypo" color="#f5cb23" />
            </View>
          </TouchableOpacity>
          {episodes}
        </ScrollView>
      </View>
    );
  }
}
