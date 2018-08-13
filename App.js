import React from 'react';
import Loading from './app/common/Loading';
import firebase from './app/config/firebase';
import {
  SignedIn,
  SignedOut,
  UserDetails,
  TutorialDisplay,
} from './app/config/router';

export default class App extends React.Component {
  constructor() {
    super();
    this.state = {
      loading: true,
      user: '',
      data: '',
    };
  }

  componentDidMount() {
    this.authSubscription = firebase.auth().onAuthStateChanged((user) => {
      this.setState({
        user,
        loading: false,
      });
      this.handleUserStatus();
    });
  }

  componentWillUnmount() {
    this.authSubscription();
  }

  handleUserStatus() {
    if (this.state.user == null) {
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
    if (this.state.loading) return <Loading />;
    if (this.state.user) {
      if (this.state.data === '') return <Loading />;
      if (this.state.data.extended) {
        if (this.state.data.tutorial) {
          return <SignedIn screenProps={{ user: this.state.user }} />;
        }
        return <TutorialDisplay screenProps={{ user: this.state.user }} />;
      }
      if (!this.state.data.extended) {
        if (this.state.data.tutorial) {
          return <SignedIn screenProps={{ user: this.state.user }} />;
        }
        return <UserDetails screenProps={{ user: this.state.user }} />;
      }
    }
    return <SignedOut />;
  }
}
