import React from 'react';
import { NetInfo, View, Alert, AsyncStorage } from 'react-native';
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

  // constructor() {
  //   super();
  //   firebase.analytics().setCurrentScreen('App');
  // }

  componentDidMount() {
    NetInfo.isConnected.addEventListener('connectionChange', this.handleConnectivityChange);
    setTimeout(() => {
      this.setTimePassed();
    }, 6000);
    this.createNotificationListeners();
  }

  componentWillUnmount() {
    // (this.state.isConnected) {
    // this.authSubscription();
    NetInfo.isConnected.removeEventListener('connectionChange', this.handleConnectivityChange);
    this.notificationListener();
    this.notificationOpenedListener();
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

  createNotificationListeners = async () => {
    /*
    * Triggered when a particular notification has been received in foreground
    * */
    this.notificationListener = firebase.notifications().onNotification(async (notification) => {
      const { title, body } = notification;
      console.log(notification);
      // this.showAlert(title, body);
      
      // const notificationArray = await AsyncStorage.getItem('notificationArray');
      // const jsonArray = JSON.parse(notificationArray);
      // const { notifications } = jsonArray;
      await AsyncStorage.setItem('notificationArray', JSON.stringify({
        notification,
      }));
    });

    /*
    * If your app is in background, you can listen for when a notification is clicked / tapped / opened as follows:
    * */
    this.notificationOpenedListener = firebase.notifications().onNotificationOpened(async (notificationOpen) => {
      const { title, body } = notificationOpen.notification;
      console.log(notificationOpen.notification);
      // this.showAlert(title, body);
      await AsyncStorage.setItem('notificationArray', JSON.stringify({
        notification: notificationOpen.notification,
      }));
    });

    /*
    * If your app is closed, you can check if it was opened by a notification being clicked / tapped / opened as follows:
    * */
    const notificationOpen = await firebase.notifications().getInitialNotification();
    if (notificationOpen) {
      const { title, body } = notificationOpen.notification;
      this.showAlert(title, body);
    }
    /*
    * Triggered for data only payload in foreground
    * */
    this.messageListener = firebase.messaging().onMessage((message) => {
      // process data message
      console.log(JSON.stringify(message));
    });
  }

  showAlert = (title, body) => {
    Alert.alert(
      title, body,
      [
        { text: 'OK', onPress: () => console.log('OK Pressed') },
      ],
      { cancelable: false },
    );
  }

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
