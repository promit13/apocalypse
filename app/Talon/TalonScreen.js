import React from 'react';
import {
  ScrollView, View, Image, TouchableOpacity, StatusBar, AsyncStorage, Alert,
} from 'react-native';
import { Text, ListItem, Icon } from 'react-native-elements';
import firebase from '../config/firebase';
import Loading from '../common/Loading';
import OfflineMsg from '../common/OfflineMsg';

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
const talonCover = require('../../img/taloncover.jpg');

export default class TalonScreen extends React.Component {
  static navigationOptions = {
    title: 'Talon',
  };

  constructor(props) {
    super(props);
    this.state = {
      talonLogs: '',
      index: 0,
      loading: true,
      lastIntel: '',
      showTalon: false,
    };
  }

  componentWillMount() {
    this.setState({ isConnected: this.props.screenProps.netInfo });
  }

  componentDidMount = async () => {
    if (!this.state.isConnected) {
      const talonLogs = await AsyncStorage.getItem('talonLogs');
      return this.setState({ loading: false, talonLogs: JSON.parse(talonLogs) });
    }
    firebase.database().ref(`logs/${this.props.screenProps.user.uid}`).on('value', (snapshot) => {
      this.setState({
        talonLogs: snapshot.val(),
        loading: false,
      });
      AsyncStorage.setItem('talonLogs', JSON.stringify(snapshot.val()));
      console.log(this.state.lastIntel);
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
            });
          }}
          >
            <View style={{
              flexDirection: 'row', padding: 16, justifyContent: 'space-between', borderWidth: 1, borderColor: 'gray',
            }}
            >
              <Text style={styles.textStyle}>
                {/* {`${Object.values(logs)[0].episodeTitle} Intel`} */}
                {`Ep. ${i} Intel`}
              </Text>
              <Icon name="chevron-right" type="feather" color="white" />
            </View>
          </TouchableOpacity>
          {
            Object.entries(logs).map(([key, value], index) => {
              const date = new Date(value.dateNow);
              const formatDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
              return (
                <ListItem
                  title={`${formatDate} - ${value.distance} k.m. in ${value.timeInterval} mins`}
                  titleStyle={styles.textStyle}
                  containerStyle={{ marginLeft: 10, marginRight: 10 }}
                  hideChevron
                />
              );
            })
          }
        </View>
      );
    }
  }

  render() {
    if (this.state.talonLogs === null) {
      return (
        <View style={[styles.mainContainer, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={[styles.textStyle, { fontSize: 16 }]}>
            Sorry you have no any logged talon.
          </Text>
        </View>
      );
    }
    const episodes = Object.entries(this.state.talonLogs).map(([key, value], i) => {
      return (
        <View>
          <ListItem
            key={key}
            roundAvatar
            avatar={speedImage}
            title={`${Object.values(value)[0].episodeTitle}`}
            titleStyle={{ color: 'white' }}
            rightIcon={{ name: 'chevron-down', type: 'feather', color: '#f5cb23' }}
            containerStyle={{ backgroundColor: '#33425a' }}
            underlayColor="#2a3545"
            onPress={() => {
              this.setState({ index: i + 1, showTalon: !this.state.showTalon });
            }}
          />
          { this.renderContent((i + 1), key, value) }
        </View>
      );
    });
    if (this.state.loading) return <Loading />;
    return (
      <View style={styles.mainContainer}>
        <StatusBar
          backgroundColor="#00000b"
        />
        <ScrollView>
          <Image
            style={styles.imageStyle}
            resizeMode="stretch"
            source={talonCover}
          />
          <TouchableOpacity onPress={() => {
            console.log(this.state.talonLogs);
            // const array = Object.keys(this.state.talonLogs);
            const episodeId = (Object.keys(this.state.talonLogs))[0];
            console.log('EpisodeId', episodeId);
            this.props.navigation.navigate('TalonIntelPlayer', {
              episodeId,
            });
          }}
          >
            <View style={styles.latestIntelView}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image style={{ height: 60, width: 60 }} source={talonImage} />
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
                    Play Latest Intel
                  </Text>
                  <Text style={{
                    fontSize: 16,
                    color: '#001331',
                    marginLeft: 10,
                    marginRight: 10,
                    fontWeight: 'bold',
                  }}
                  >
                    {`${Object.values(Object.values(this.state.talonLogs)[0])[0].episodeTitle}`}
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
