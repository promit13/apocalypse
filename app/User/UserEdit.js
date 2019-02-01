import React from 'react';
import {
  View, Text, Modal, TextInput, TouchableOpacity, Image, ScrollView, Dimensions, AsyncStorage, Switch, Platform,
} from 'react-native';
import { ListItem, Button } from 'react-native-elements';
import { AccessToken } from 'react-native-fbsdk';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import firebase from '../config/firebase';
import Loading from '../common/Loading';
import ErrorMessage from '../common/Error';
import ShowModal from '../common/ShowModal';

const { width } = Dimensions.get('window');
const imageSize = width - 120;

const talonImage = require('../../img/talon.png');

const listItems = ['Sign Out', 'Change Password', 'Delete Account'];
const styles = {
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#001331',
  },
  text: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
  },
  button: {
    borderRadius: 5,
    backgroundColor: '#001331',
  },
  modalView: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    padding: 10,
  },
  modalInnerView: {
    backgroundColor: '#f2f2f2',
    padding: 10,
  },
  inputStyle: {
    borderColor: '#001331',
    borderRadius: 5,
    borderWidth: 2,
    padding: 10,
    height: 40,
    color: '#001331',
    margin: 10,
  },
  imageStyle: {
    height: scale(imageSize),
    width: scale(imageSize),
    alignSelf: 'center',
    marginTop: 20,
  },
};
export default class MyAccount extends React.Component {
  static navigationOptions = {
    title: 'My Account',
  };

  state = {
    password: '',
    showModal: false,
    showInternetModal: false,
    showLogoutModal: false,
    showError: false,
    showLoading: false,
    providerId: 'password',
    switchValue: false,
    platform: 'android',
  };

  componentDidMount = async () => {
    const { providerData } = this.props.screenProps.user;
    const platform = Platform.OS;
    // const switchValue = await AsyncStorage.getItem('distanceUnit');
    firebase.database().ref(`users/${this.props.screenProps.user.uid}`).on('value', (snapShot) => {
      if (snapShot.val() === null) {
        return;
      }
      const { distanceUnit } = snapShot.val();
      this.setState({
        providerId: providerData[0].providerId,
        switchValue: distanceUnit,
        platform,
      });
    });
  }

  logOut = () => {
    firebase.auth().signOut().then(() => {
      this.deleteUserAsync();
    });
  }

  authenticateUser = async () => {
    const { providerId } = this.state;
    console.log(providerId);
    const user = firebase.auth().currentUser;
    let credentials;
    if (providerId === 'password') {
      credentials = await firebase.auth.EmailAuthProvider.credential(
        user.email,
        this.state.password,
      );
    } else {
      await AccessToken.getCurrentAccessToken().then(
        (data) => {
          credentials = firebase.auth.FacebookAuthProvider.credential(data.accessToken);
        },
      );
    }
    user.reauthenticateAndRetrieveDataWithCredential(credentials)
      .then(() => {
        console.log(credentials);
        this.deleteAccount();
      }).catch(() => this.setState({ showError: true, showLoading: false }));
  }

  deleteAccount = () => {
    firebase.auth().currentUser.delete()
      .then(() => {
        firebase.database().ref(`users/${this.props.screenProps.user.uid}`).remove();
        this.deleteUserAsync();
        this.setState({ showError: false, showLoading: false });
      })
      .catch(err => console.log(err));
  }

  deleteUserAsync = async () => {
    await AsyncStorage.removeItem('login');
  }

  showModal = () => {
    const { providerId } = this.state;
    const { netInfo } = this.props.screenProps;
    return (
      <Modal transparent visible={this.state.showModal}>
        <View style={styles.modalView}>
          <TouchableOpacity onPress={() => this.setState({ showModal: false, password: '' })}>
            <View style={styles.modalInnerView}>
              {
                providerId === 'password'
                  ? (
                    <TextInput
                      underlineColorAndroid="transparent"
                      secureTextEntry
                      style={styles.inputStyle}
                      placeholder="Confirm your password"
                      placeholderTextColor="#001331"
                      onChangeText={password => this.setState({ password })}
                      value={this.state.password}
                    />
                  )
                  : null
              }
              {this.state.showError ? <ErrorMessage errorMessage="Incorrect password" /> : null}
              {this.state.showLoading ? <Loading /> : null}
              <Button
                color="gray"
                buttonStyle={[styles.button, { backgroundColor: 'white' }]}
                title="Cancel"
                onPress={() => {
                  this.setState({ showModal: false });
                }}
              />
              <Button
                color="#fff"
                buttonStyle={[styles.button, { marginTop: 10 }]}
                title="Confirm"
                onPress={() => {
                  if (!netInfo) {
                    return this.setState({ showInternetModal: true });
                  }
                  this.setState({ showLoading: true });
                  this.authenticateUser();
                }}
              />
              {/* </View> */}
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  renderListItem = () => {
    const { netInfo } = this.props.screenProps;
    const { providerId } = this.state;
    const items = listItems.map((item, index) => {
      if (index === 1 && providerId !== 'password') {
        return console.log('FACEBOOK PROVIDER');
      }
      return (
        <ListItem
          key={item}
          title={item}
          titleStyle={{ color: 'white' }}
          underlayColor="#2a3545"
          onPress={() => {
            if (!netInfo) {
              return this.setState({ showInternetModal: true });
            }
            if (index === 0) {
              return this.setState({ showLogoutModal: true });
            }
            if (index === 1) {
              return this.props.navigation.navigate('ChangeEmailPassword');
            }
            if (index === 2) {
              return this.setState({ showModal: true });
            }
          }}
        />
      );
    });
    return items;
  }

  setSwitchValue = async (switchValue) => {
    this.setState({ switchValue });
    // await AsyncStorage.setItem('distanceUnit', switchValue ? 'miles' : 'k.m.');
    firebase.database().ref(`users/${this.props.screenProps.user.uid}`).update({
      distanceUnit: switchValue,
    });
  }

  render() {
    const { user } = this.props.screenProps;
    const { platform, showInternetModal, showLogoutModal } = this.state;
    return (
      <View style={styles.container}>
        <ScrollView>
          <Image style={styles.imageStyle} source={talonImage} />
          {this.showModal()}
          <ShowModal
            visible={showLogoutModal}
            title="Are you sure you want to sign out?"
            buttonText="Confirm"
            secondButtonText="Cancel"
            askAdvance
            onSecondButtonPress={() => {
              this.setState({ showLogoutModal: false });
            }}
            onPress={() => this.logOut()}
          />
          <ShowModal
            visible={showInternetModal}
            title="Please check your internet connection"
            buttonText="Ok"
            onPress={() => this.setState({ showInternetModal: false })}
          />
          <View style={{ alignSelf: 'center', marginBottom: 10 }}>
            <Text style={[styles.text, { marginTop: 10, fontWeight: 'bold' }]}>
              Welcome, Agent Whiskey Gambit
            </Text>
            <Text style={styles.text}>
              {user.email}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', marginLeft: 30, marginBottom: 10, marginTop: 30, alignItems: 'center' }}>
            <Text style={styles.text}>
              Use Imperial Units
            </Text>
            <Switch
              value={this.state.switchValue}
              onValueChange={switchValue => this.setSwitchValue(switchValue)}
              style={{ marginLeft: 10 , transform: [{ scaleX: platform === 'ios' ? 0.7 : 1 }, { scaleY: platform === 'ios' ? 0.7 : 1 }] }}
            />
          </View>
          <View style={{ padding: 10, backgroundColor: '#33425a' }}>
            {this.renderListItem()}
          </View>
        </ScrollView>
      </View>
    );
  }
}
