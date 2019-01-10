import React from 'react';
import { NetInfo, View } from 'react-native';
import { Provider } from 'react-redux';
import store from './app/store';
import Splashscreen from './app/common/Splashscreen';
import Home from './app/User/Home';

export default class App extends React.Component {
  state = {
    isConnected: true,
    timePassed: false,
  }

  componentDidMount() {
    NetInfo.isConnected.addEventListener('connectionChange', this.handleConnectivityChange);
    setTimeout(() => {
      this.setTimePassed();
    }, 5000);
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
        <View style={{ flex: 1 }}>
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

// const mapStateToProps = ({ internetReducer }) => {
//   return { isConnected: internetReducer.isConnected };
// };

// const mapDispatchToProps = {
//   connectionState,
// };

// export default connect(mapStateToProps, mapDispatchToProps)(App);
