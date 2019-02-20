import React from 'react';
import { NetInfo, View, SafeAreaView } from 'react-native';
import { Provider } from 'react-redux';
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
    console.log(isConnected);
    this.setState({ isConnected });
  };

  render() {
    console.disableYellowBox = true;
    console.log(this.state.isConnected);
    return (
      <Provider store={store}>
        <View style={styles.mainContainer}>
          {
            this.state.timePassed
              ? <Home screenProps={{ netInfo: this.state.isConnected }} />
              : <Splashscreen />
          }
        </View>
      </Provider>
    );
  }
}
