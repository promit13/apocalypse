import React from 'react';
import { Text } from 'react-native';
import Loading from './app/common/Loading';
import firebase from './app/config/firebase';
import { SignedIn, SignedOut } from './app/config/router';


export default class App extends React.Component {
  constructor() {
    super();
    this.state = {
      loading: true,
      user: '',
    };
  }

  componentDidMount() {
    this.authSubscription = firebase.auth().onAuthStateChanged((user) => {
      this.setState({
        loading: false,
        user,
      });
    });
  }

  componentWillUnmount() {
    this.authSubscription();
  }

  render() {
    // The application is initialising
    if (this.state.loading) return <Loading />;
    // The user is an Object, so they're logged in
    if (this.state.user) return <SignedIn screenProps={{user: this.state.user}} />;
    return <SignedOut />;
  }
}
