import React from 'react';
import { NetInfo } from 'react-native';
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
      user: '',
      data: '',
      isConnected: true,
    };
  }

  componentDidMount() {
    NetInfo.isConnected.addEventListener('connectionChange', this.handleConnectivityChange);
  }

  componentWillUnmount() {
    if (this.state.isConnected) {
      this.authSubscription();
    }
    NetInfo.isConnected.removeEventListener('connectionChange', this.handleConnectivityChange);
  }

  handleConnectivityChange = (isConnected) => {
    if (isConnected) {
      this.setState({ isConnected });
      this.authSubscription = firebase.auth().onAuthStateChanged((user) => {
        this.setState({
          user,
          loading: false,
        });
        this.handleUserStatus();
      });
    } else {
      this.setState({ isConnected });
    }
  };

  handleUserStatus = () => {
    if (this.state.user === null) {
      return;
    }
    firebase.database().ref(`users/${this.state.user.uid}`)
      .on('value', (snapshot) => {
        snapshot.val();
        this.setState({ data: snapshot.val() });
      });
  }

  render() {
    console.disableYellowBox = true;
    if (!this.state.isConnected) return <DownloadDisplay screenProps={{ isConnected: this.state.isConnected }} />;
    if (this.state.loading) return <LoadScreen />;
    if (this.state.user) {
      if (this.state.data === '') return <LoadScreen />;
      if (this.state.data === null) return <SignedOut />;
      if (this.state.data.extended) {
        if (this.state.data.tutorial) {
          return <SignedIn screenProps={{ user: this.state.user, isConnected: this.state.isConnected }} />;
        }
        return <TutorialDisplay screenProps={{ user: this.state.user, isConnected: this.state.isConnected }} />;
      }
      if (!this.state.data.extended) {
        if (this.state.data.tutorial) {
          return <SignedIn screenProps={{ user: this.state.user, isConnected: this.state.isConnected }} />;
        }
        return <UserDetails screenProps={{ user: this.state.user, isConnected: this.state.isConnected }} />;
      }
    }
    return <SignedOut />;
  }
}
