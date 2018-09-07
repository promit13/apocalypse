import React from 'react';
import {
  ScrollView, View, Image, TouchableOpacity, StatusBar,
} from 'react-native';
import { Text, ListItem, Icon } from 'react-native-elements';
import firebase from '../config/firebase';
import Loading from '../common/Loading';

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
    fontSize: 18,
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
const talonImage = require('../../img/talon.png');
const speedImage = require('../../img/speed.png');

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
    };
  }

  componentDidMount() {
    firebase.database().ref(`logs/${this.props.screenProps.user.uid}`).on('value', (snapshot) => {
      this.setState({
        talonLogs: snapshot.val(),
        loading: false,
      });
      console.log(this.state.lastIntel);
    });
  }

  renderContent = (i, episodeId, logs) => {
    if (this.state.index === i && logs !== null) {
      return (
        <View style={{ backgroundColor: '#445878' }}>
          <TouchableOpacity onPress={() => this.props.navigation.navigate('TalonIntelPlayer', {
            episodeId,
          })}
          >
            <View style={{
              flexDirection: 'row', padding: 16, justifyContent: 'space-between', borderWidth: 1, borderColor: 'gray',
            }}
            >
              <Text style={{ fontSize: 18, color: 'white' }}>
                {`${Object.values(logs)[0].episodeTitle}`}
              </Text>
              <Icon name="chevron-right" type="feather" color="white" />
            </View>
          </TouchableOpacity>
          {
            Object.entries(logs).map(([key, value], index) => {
              const date = new Date(value.dateNow);
              const formatDate = `${date.getDate()}/${date.getMonth()}/ ${date.getFullYear()}`;
              return (
                <ListItem
                  title={`${formatDate} -Ep${i}- ${value.timeStamp}`}
                  titleStyle={{ color: 'white', fontSize: 18 }}
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
          <Text style={styles.textStyle}>
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
              this.setState({ index: i + 1 });
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
            source={{ uri: 'https://firebasestorage.googleapis.com/v0/b/astraining-95c0a.appspot.com/o/temp%2FHome.jpg?alt=media&token=8c4beb9d-d6c3-43f7-a5a6-27527fe21029' }}
          />
          <TouchableOpacity onPress={() => {
            // const array = Object.keys(this.state.talonLogs);
            const episodeId = Object.keys(this.state.talonLogs)[0];
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
