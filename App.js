import React from 'react';
import { NetInfo, View } from 'react-native';
import LoadScreen from './app/LoadScreen';
import firebase from './app/config/firebase';
import {
  SignedIn,
  SignedOut,
  UserDetails,
  TutorialDisplay,
  DownloadDisplay,
} from './app/config/router';

export default class App extends React.Component {
  constructor() {
    super();
    this.state = {
      loading: true,
      user: null,
      data: null,
      isConnected: true,
    };
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
      // this.setState({ isConnected });
      this.authSubscription = firebase.auth().onAuthStateChanged((user) => {
        this.setState({
          user,
          loading: false,
          isConnected,
        });
        console.log('check');
        this.handleUserStatus();
      });
    } else {
      this.setState({ isConnected });
    }
  };

  handleUserStatus = () => {
    console.log(' 2 check');
    console.log(this.state.user);
    if (this.state.user === null) {
      return;
    }
    firebase.database().ref(`users/${this.state.user.uid}`)
      .on('value', (snapshot) => {
        snapshot.val();
        this.setState({ data: snapshot.val() });
      });
  }

  renderComponent = () => {
    console.log(this.state.user);
    console.log(this.state.data);
    if (this.state.loading) return <LoadScreen />;
    if (!this.state.isConnected) return <DownloadDisplay screenProps={{ netInfo: this.state.isConnected }} />;
    if (this.state.user) {
     // if (this.state.data === '') return <LoadScreen />;
      if (this.state.data === null) return <LoadScreen />;
      if (this.state.data.extended) {
        if (this.state.data.tutorial) {
          return <SignedIn screenProps={{ user: this.state.user, netInfo: this.state.isConnected }} />;
        }
        return <TutorialDisplay screenProps={{ user: this.state.user, netInfo: this.state.isConnected }} />;
      }
      if (!this.state.data.extended) {
        if (this.state.data.tutorial) {
          return <SignedIn screenProps={{ user: this.state.user, netInfo: this.state.isConnected }} />;
        }
        return <UserDetails screenProps={{ user: this.state.user, netInfo: this.state.isConnected }} />;
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
