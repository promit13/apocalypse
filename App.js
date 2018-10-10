import React from 'react';
import { NetInfo, View, AsyncStorage } from 'react-native';
import LoadScreen from './app/LoadScreen';
import firebase from './app/config/firebase';
import {
  SignedIn,
  SignedOut,
  UserDetails,
  TutorialDisplay,
} from './app/config/router';

export default class App extends React.Component {
  state = {
    loading: true,
    user: null,
    data: null,
    isConnected: true,
  }

  componentDidMount() {
    NetInfo.isConnected.addEventListener('connectionChange', this.handleConnectivityChange);
  }

  componentWillUnmount() {
    if (this.state.isConnected) {
      this.authSubscription();
      NetInfo.isConnected.removeEventListener('connectionChange', this.handleConnectivityChange);
    }
  }

  handleConnectivityChange = (isConnected) => {
    if (isConnected) {
      this.authSubscription = firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          this.setState({
            user,
            isConnected,
          });
          this.handleUserStatus();
        } else {
          this.setState({ loading: false, isConnected });
        }
      });
    } else {
      this.setState({ isConnected, loading: false });
    }
  };

  handleUserStatus = async () => {
    if (this.state.user === null) {
      return this.setState({ loading: false });
    }
    try {
      const toLogDataObject = await AsyncStorage.getItem('distance');
      if (toLogDataObject !== null) {
        const toLogData = JSON.parse(toLogDataObject);
        console.log(toLogData);
        const {
          uid, episodeId, logId, timeStamp, dateNow, episodeTitle, distance, timeInterval,
        } = toLogData;
        const formattedTimeInterval = (timeInterval / 60000).toFixed(2);
        firebase.database().ref(`logs/${uid}/${episodeId}`).push({
          timeStamp,
          dateNow,
          episodeTitle,
          distance,
          timeInterval: formattedTimeInterval,
        }).then(() => AsyncStorage.removeItem('distance'));
      }
      firebase.database().ref(`users/${this.state.user.uid}`)
        .on('value', (snapshot) => {
          snapshot.val();
          this.setState({ data: snapshot.val(), loading: false });
        });
    } catch (err) {
      console.log(err);
    }
  }

  // if (!this.state.isConnected) {
  //   return <SignedIn screenProps={{ netInfo: this.state.isConnected, user: this.state.user }} />;
  // }

  renderComponent = () => {
    if (this.state.loading) return <LoadScreen />;
    if (this.state.user) {
      if (!this.state.isConnected) return <SignedIn />;
      if (this.state.data === null) return <LoadScreen />;
      if (this.state.data.extended) {
        if (this.state.data.tutorial) {
          return (
            <SignedIn screenProps={{ user: this.state.user, netInfo: this.state.isConnected }} />
          );
        }
        return (
          <TutorialDisplay
            screenProps={{ user: this.state.user, netInfo: this.state.isConnected }}
          />
        );
      }
      if (!this.state.data.extended) {
        if (this.state.data.tutorial) {
          return (
            <SignedIn
              screenProps={{ user: this.state.user, netInfo: this.state.isConnected }}
            />
          );
        }
        return (
          <UserDetails
            screenProps={{ user: this.state.user, netInfo: this.state.isConnected }}
          />
        );
      }
    }
    return <SignedOut />;
  }

  render() {
    console.disableYellowBox = true;
    return (
      <View style={{ flex: 1 }}>
        {this.renderComponent()}
      </View>
    );
  }
}
