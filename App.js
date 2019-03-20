import React from 'react';
import { NetInfo, View } from 'react-native';
import { Provider } from 'react-redux';
import firebase from 'react-native-firebase';
import store from './app/store';
import Splashscreen from './app/common/Splashscreen';
import Home from './app/User/Home';

const styles = {
  mainContainer: {
    flex: 1,
    backgroundColor: '#001331',
  },
};
export default class App extends React.Component {
  state = {
    isConnected: true,
    timePassed: false,
    connectionType: 'wifi',
  }

  constructor() {
    super();
    firebase.analytics().setCurrentScreen('App');
  }

  componentDidMount() {
    NetInfo.isConnected.addEventListener('connectionChange', this.handleConnectivityChange);
    setTimeout(() => {
      this.setTimePassed();
    }, 6000);
  }

  componentWillUnmount() {
    // (this.state.isConnected) {
    // this.authSubscription();
    NetInfo.isConnected.removeEventListener('connectionChange', this.handleConnectivityChange);
    // }
  }

  setTimePassed() {
    this.setState({ timePassed: true });
  }

  handleConnectivityChange = (isConnected) => {
    // this.props.connectionState(isConnected);
    if (isConnected) {
      NetInfo.getConnectionInfo().then((connectionInfo) => {
        this.setState({ connectionType: connectionInfo.type, isConnected });
      });
      return;
    }
    this.setState({ isConnected });
  };

  render() {
    console.disableYellowBox = true;
    const { isConnected, connectionType } = this.state;
    return (
      <Provider store={store}>
        <View style={styles.mainContainer}>
          {
            this.state.timePassed
              ? <Home screenProps={{ netInfo: isConnected, connectionType }} />
              : <Splashscreen />
          }
        </View>
      </Provider>
    );
  }
}
