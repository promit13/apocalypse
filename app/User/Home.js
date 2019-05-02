import React from 'react';
import { View, AsyncStorage, Alert } from 'react-native';
import { SafeAreaView } from 'react-navigation';
import axios from 'axios';
import LoadScreen from '../common/LoadScreen';
import firebase from '../config/firebase';
import realm from '../config/Database';
import {
  SignedIn,
  SignedOut,
  TutorialDisplay,
} from '../config/router';

const styles = {
  mainContainer: {
    flex: 1,
    backgroundColor: '#001331',
  },
};
export default class Home extends React.Component {
  state = {
    loading: true,
    user: null,
    data: null,
    userLoggedIn: false,
  }

  componentDidMount() {
    const { netInfo } = this.props.screenProps;
    console.log(netInfo);
    // this.setState({ isConnected: netInfo });
    this.handleConnectivityChange(netInfo);
  }

  // componentDidUpdate(prevProps, prevState) {
  //   if (this.props.screenProps.netInfo !== prevState.isConnected) {
  //     // this.handleConnectivityChange(this.props.screenProps.netInfo);
  //     this.renderComponent();
  //   }
  // }

  handleConnectivityChange = async (isConnected) => {
    if (isConnected) {
      this.authSubscription = firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          this.setState({
            user,
          });
          this.sendDataToFirebase();
          this.handleUserStatus();
        } else {
          this.setState({ loading: false, user: null });
        }
      });
    } else {
      const checkLoggedIn = await AsyncStorage.getItem('login');
      if (checkLoggedIn !== null) {
        this.setState({ loading: false, userLoggedIn: true });
      } else {
        this.setState({ loading: false });
      }
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
        const {
          uid, episodeId, episodeTitle, episodeIndex, seriesIndex, episodeCompleted,
        } = toLogData;
        // const formattedTimeInterval = (timeInterval / 60000).toFixed(2);
        firebase.database().ref(`userDatas/${uid}/lastPlayedEpisode`).set(
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
        .on('value', async (snapshot) => {
          await AsyncStorage.setItem('login', 'loggedIn');
          this.setState({ data: snapshot.val(), loading: false });
        });
    } catch (err) {
      console.log(err);
    }
  }

  sendEmail = (episodeIndex, seriesBought, episodeCompleted) => {
    axios.post('https://us-central1-astraining-95c0a.cloudfunctions.net/sendMailChimp', {
      email: 'ab@a.com',
      episodeIndex: '2',
      seriesBought,
      episodeCompleted,
    })
      .then(response => console.log(response))
      .catch(err => console.log(err));
  }

  setEmailData = (sendTo, uid, episodeIndex, episodeCompleted, check, epOneNotCompleted) => {
    console.log(sendTo);
    firebase.database().ref(`userDatas/${uid}/${sendTo}`).set({
      emailSent: '1',
    }).then(() => {
      this.sendEmail(episodeIndex, true, episodeCompleted);
      console.log('EMAIL TRIGGERED');
      if (check && epOneNotCompleted === true) {
        firebase.database().ref(`userDatas/${uid}/epOneNotCompleted`).set({
          emailSent: '1',
        });
      }
    })
      .catch(err => console.log(err));
  }

  sendDataToFirebase = async () => {
    const offlineData = await AsyncStorage.getItem('lastPlayedEpisode');
    if (offlineData !== null) {
      const jsonObjectData = JSON.parse(offlineData);
      const {
        userId,
        epId,
        epTitle,
        epIndex,
        serIndex,
        epCompleted,
      } = jsonObjectData;
      firebase.database().ref(`userDatas/${userId}/lastPlayedEpisode`).set(
        {
          episodeTitle: epTitle,
          episodeId: epId,
          episodeIndex: epIndex,
          seriesIndex: serIndex,
          episodeCompleted: epCompleted,
        },
      ).then(() => AsyncStorage.removeItem('lastPlayedEpisode'));
    }
    const allEpisodeWorkoutArray = Array.from(realm.objects('SavedWorkOut'));
    allEpisodeWorkoutArray.map(async (value, index) => {
      const { episodeId, uid, workOutLogs } = value;
      if (index === 0) {
        const offlineEmailData = await AsyncStorage.getItem('emailTrigger');
        if (offlineEmailData !== null) {
          console.log(offlineEmailData);
          const jsonObjectEmailData = JSON.parse(offlineEmailData);
          const {
            epOneCompleted,
            epOneNotCompleted,
            epTwoCompleted,
            epThreeCompleted,
            epTenCompleted,
          } = jsonObjectEmailData;
          if (epOneCompleted === true) {
            this.setEmailData('epOneCompleted', uid, 0, true, true, epOneNotCompleted);
          }
          if (!epOneCompleted) {
            if (epOneNotCompleted) {
              this.setEmailData('epOneNotCompleted', uid, 0, false);
            }
          }
          if (epTwoCompleted) {
            this.setEmailData('epTwoCompleted', uid, 1, true);
          }
          if (epThreeCompleted) {
            this.setEmailData('epThreeCompleted', uid, 2, true);
          }
          if (epTenCompleted) {
            this.setEmailData('epTenCompleted', uid, 9, true);
          }
          AsyncStorage.setItem('emailTrigger', JSON.stringify({
            epOneCompleted: epOneCompleted === true ? '1' : epOneCompleted,
            epOneNotCompleted: epOneNotCompleted === true ? '1' : epOneNotCompleted,
            epTwoCompleted: epTwoCompleted === true ? '1' : epTwoCompleted,
            epThreeCompleted: epThreeCompleted === true ? '1' : epThreeCompleted,
            epTenCompleted: epTenCompleted === true ? '1' : epTenCompleted,
          }));
        }
      }
      const workOutLogsArray = Array.from(workOutLogs);
      const workOutArrayLength = workOutLogsArray.length;
      workOutLogsArray.map((workOutValue, workOutIndex) => {
        if (workOutIndex === 0) {
          return;
        }
        if ((workOutIndex === workOutArrayLength - 1) && (index === allEpisodeWorkoutArray.length - 1)) {
          const {
            workOutCompleted,
          } = workOutValue;
          if (workOutCompleted) {
            firebase.database().ref(`userDatas/${uid}/episodeCompletedArray`).push(
              {
                episodeId,
              },
            );
          }
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
      },
    );
  }

  renderComponent = () => {
    const { loading, userLoggedIn, user, data } = this.state;
    const { netInfo, connectionType } = this.props.screenProps;
    if (loading) return <LoadScreen text="Preparing your apocalypse" />;
    if (!netInfo && userLoggedIn) {
      return <SignedIn screenProps={{ user, netInfo, connectionType }} />;
    }
    if (user) {
      if (data === null) return <LoadScreen />;
      if (data.tutorial) {
        return (
          <SignedIn screenProps={{ user, netInfo, connectionType }} />
        );
      }
      if (!data.tutorial) {
        return (
          <TutorialDisplay
            screenProps={{ user, netInfo, connectionType }}
          />
        );
      }
    }
    return <SignedOut screenProps={{ netInfo }} />;
  }

  render() {
    console.disableYellowBox = true;
    return (
      <SafeAreaView style={styles.mainContainer} forceInset={{ top: 'never' }}>
        <View style={styles.mainContainer}>
          {
            this.renderComponent()
          }
        </View>
      </SafeAreaView>
    );
  }
}
