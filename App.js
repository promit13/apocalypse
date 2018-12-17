import React from 'react';
import { NetInfo, View, AsyncStorage } from 'react-native';
import { Provider } from 'react-redux';
import store from './app/store';
import LoadScreen from './app/common/LoadScreen';
import firebase from './app/config/firebase';
import realm from './app/config/Database';
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
    // (this.state.isConnected) {
    this.authSubscription();
    NetInfo.isConnected.removeEventListener('connectionChange', this.handleConnectivityChange);
    // }
  }

  handleConnectivityChange = (isConnected) => {
    if (isConnected) {
      this.authSubscription = firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          this.setState({
            user,
            isConnected,
          });
          this.sendDataToFirebase();
          this.handleUserStatus();
        } else {
          this.setState({ loading: false, isConnected, user: null });
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
      console.log(toLogDataObject);
      if (toLogDataObject !== null) {
        const toLogData = JSON.parse(toLogDataObject);
        const {
          uid, episodeId, episodeTitle, episodeIndex, seriesIndex, episodeCompleted,
        } = toLogData;
        // const formattedTimeInterval = (timeInterval / 60000).toFixed(2);
        firebase.database().ref(`users/${uid}/lastPlayedEpisode`).set(
          {
            episodeTitle,
            episodeId,
            episodeIndex,
            seriesIndex,
            episodeCompleted,
          },
        ).then(() => {
          this.checkLogIfExists(true, toLogData, uid, episodeId);
        })
          .catch(error => console.log(error));
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

  sendDataToFirebase = () => {
    const allEpisodeWorkoutArray = Array.from(realm.objects('SavedWorkOut'));
    allEpisodeWorkoutArray.map((value, index) => {
      const { episodeId, uid, workOutLogs } = value;
      const workOutLogsArray = Array.from(workOutLogs);
      const workOutArrayLength = workOutLogsArray.length;
      workOutLogsArray.map((workOutValue, workOutIndex) => {
        if (workOutIndex === 0) {
          return;
        }
        if ((workOutIndex === workOutArrayLength - 1) && (index === allEpisodeWorkoutArray.length - 1)) {
          const {
            episodeTitle,
            episodeIndex,
            seriesIndex,
            episodeCompleted,
          } = workOutValue;
          firebase.database().ref(`users/${uid}/lastPlayedEpisode`).set(
            {
              episodeTitle,
              episodeId,
              episodeIndex,
              seriesIndex,
              episodeCompleted,
            },
          ).then(() => {
            if (episodeCompleted) {
              firebase.database().ref(`users/${uid}/episodeCompletedArray`).push(
                {
                  episodeId,
                },
              );
            }
          });
        }
        this.checkLogIfExists(false, workOutValue, uid, episodeId, workOutIndex, workOutArrayLength, workOutLogsArray);
      });
    });
  }

  updateDatabase = (uid, episodeId, workOutLogsArray, workOutIndex) => {
    const array = workOutLogsArray.slice(workOutIndex);
    realm.write(() => {
      realm.create('SavedWorkOut', {
        uid, episodeId, workOutLogs: array,
      }, true);
    });
  }

  getLastLogId = (check, snapshot, workOutValue, uid, episodeId, workOutIndex, workOutArrayLength, workOutLogsArray) => {
    const {
      timeStamp,
      workoutDate,
      episodeTitle,
      distance,
      steps,
      episodeIndex,
      seriesIndex,
      workOutTime,
      workOutCompleted,
      timeInterval,
      trackingStarted,
      category,
    } = workOutValue;
    const idArray = Object.keys(snapshot);
    const valueArray = Object.values(snapshot);
    const logId = idArray[idArray.length - 1];
    const value = valueArray[idArray.length - 1];
    const { dateNow } = value;
    const currentDate = new Date().getTime();
    if ((currentDate - dateNow) > 900000) {
      firebase.database().ref(`logs/${uid}/${episodeId}`).push({
        timeStamp,
        dateNow: workoutDate,
        episodeTitle,
        distance,
        steps,
        episodeIndex,
        seriesIndex,
        workOutTime,
        workOutCompleted,
        timeInterval,
        trackingStarted,
        category,
      }).then(() => {
        if (check) {
          return AsyncStorage.removeItem('distance');
        }
        if (workOutIndex === workOutArrayLength - 1) {
          this.updateDatabase(uid, episodeId, workOutLogsArray, workOutIndex);
        }
      })
        .catch(error => console.log(error));
    } else {
      firebase.database().ref(`logs/${uid}/${episodeId}/${logId}`).set({
        timeStamp,
        dateNow: workoutDate,
        episodeTitle,
        distance,
        steps,
        episodeIndex,
        seriesIndex,
        workOutTime,
        workOutCompleted,
        timeInterval,
        trackingStarted,
        category,
      }).then(() => {
        if (check) {
          return AsyncStorage.removeItem('distance');
        }
        if (workOutIndex === workOutArrayLength - 1) {
          this.updateDatabase(uid, episodeId, workOutLogsArray, workOutIndex);
        }
      })
        .catch(error => console.log(error));
    }
  }

  checkLogIfExists = (check, workOutValue, uid, episodeId, workOutIndex, workOutArrayLength, workOutLogsArray) => {
    const {
      episodeTitle,
      episodeIndex,
      seriesIndex,
      category,
    } = workOutValue;
    firebase.database().ref(`logs/${uid}/${episodeId}/`).on(
      'value', (snapshot) => {
        if (snapshot.val() === null) {
          firebase.database().ref(`logs/${uid}/${episodeId}/`).push({
            timeStamp: 0.0,
            dateNow: 0.0,
            episodeTitle,
            distance: 0.0,
            timeInterval: 0,
            steps: 0,
            episodeIndex,
            seriesIndex,
            trackingStarted: false,
            workOutTime: 0,
            category,
            workOutCompleted: false,
          }).then(() => {
            firebase.database().ref(`logs/${uid}/${episodeId}/`).on(
              'value', (snap) => {
                this.getLastLogId(check, snap.val(), workOutValue, uid, episodeId, workOutIndex, workOutArrayLength, workOutLogsArray);
              },
            );
          })
            .catch(error => console.log(error));
        } else {
          this.getLastLogId(check, snapshot.val(), workOutValue, uid, episodeId, workOutIndex, workOutArrayLength, workOutLogsArray);
        }
      }
    );
  }

  renderComponent = () => {
    if (this.state.loading) return <LoadScreen />;
    if (!this.state.isConnected) {
      return <SignedIn screenProps={{ user: this.state.user, netInfo: this.state.isConnected }} />;
    }
    if (this.state.user) {
      if (this.state.data === null) return <LoadScreen />;
      if (this.state.data.tutorial) {
        return (
          <SignedIn screenProps={{ user: this.state.user, netInfo: this.state.isConnected }} />
        );
      }
      if (!this.state.data.tutorial) {
        return (
          <TutorialDisplay
            screenProps={{ user: this.state.user, netInfo: this.state.isConnected }}
          />
        );
      }
      // if (this.state.data.extended) {
      //   if (this.state.data.tutorial) {
      //     return (
      //       <SignedIn screenProps={{ user: this.state.user, netInfo: this.state.isConnected }} />
      //     );
      //   }
      //   return (
      //     <TutorialDisplay
      //       screenProps={{ user: this.state.user, netInfo: this.state.isConnected }}
      //     />
      //   );
      // }
      // if (!this.state.data.extended) {
      //   if (this.state.data.tutorial) {
      //     return (
      //       <SignedIn
      //         screenProps={{ user: this.state.user, netInfo: this.state.isConnected }}
      //       />
      //     );
      //   }
      //   return (
      //     <UserDetails
      //       screenProps={{ user: this.state.user, netInfo: this.state.isConnected }}
      //     />
      //   );
      // }
    }
    return <SignedOut />;
  }

  render() {
    console.disableYellowBox = true;
    return (
      <Provider store={store}>
        <View style={{ flex: 1 }}>
          {this.renderComponent()}
        </View>
      </Provider>
    );
  }
}
