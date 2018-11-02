import React from 'react';
import {
  View, TextInput, ImageBackground, StyleSheet, ScrollView, Image, Dimensions, TouchableOpacity,
} from 'react-native';
import { Button, Icon, Text, SocialIcon } from 'react-native-elements';
import { LoginManager, AccessToken } from 'react-native-fbsdk';
import axios from 'axios';
import firebase from '../config/firebase';
import Loading from '../common/Loading';
import ErrorMessage from '../common/Error';

const { width } = Dimensions.get('window');
const imageSize = width - 120;

const talonImage = require('../../img/talon.png');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#001331',
  },
  fieldContainer: {
    flexDirection: 'row',
    backgroundColor: '#3C5A96',
    borderRadius: 5,
    alignItems: 'center',
    padding: 15,
    marginBottom: 15,
  },
  inputStyle: {
    flex: 1,
    height: 40,
    color: 'white',
    marginLeft: 10,
    fontSize: 20,
  },
  button: {
    width: '100%',
  },
  imageStyle: {
    height: imageSize,
    width: imageSize,
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 20,
    justifyContent: 'center',
    alignContent: 'center',
  },
  text: {
    fontWeight: 'bold',
    color: 'white',
    fontSize: 20,
    marginLeft: 15,
  },
});


export default class Login extends React.Component {
  static navigationOptions = {
    header: null,
  };

  state = {
    showLoading: false,
  }

  doFacebookSignUp = () => {
    LoginManager.logInWithReadPermissions(['public_profile', 'email']).then(
      (result) => {
        if (result.isCancelled) {
          this.setState({ showLoading: false });
        } else {
          AccessToken.getCurrentAccessToken()
            .then((data) => {
              axios.get(
                `https://graph.facebook.com/v3.1/me?access_token=${data.accessToken}&fields=email,first_name,last_name`,
              ).then((response) => {
                const { email, first_name, last_name} = response.data;
                const credential = firebase.auth.FacebookAuthProvider.credential(data.accessToken);
                firebase.auth().signInAndRetrieveDataWithCredential(credential)
                  .then((currentUser) => {
                    firebase.database().ref(`users/${currentUser.user.uid}`).set({
                      firstName: first_name,
                      lastName: last_name,
                      email,
                      age: 0,
                      weight: 0,
                      height: 0,
                      gender: '',
                      extended: false,
                      tutorial: false,
                      fullNameLowercase: `${first_name.toLowerCase()} ${last_name.toLocaleLowerCase()}`,
                      purchases: '',
                      lastPlayedEpisode: '',
                      checked: false,
                    })
                      .then(() => {
                        this.setState({ showLoading: false });
                      });
                  })
                  .catch((error) => {
                    this.setState({ showLoading: false });
                    console.log(error);
                  });
              });
            });
        }
      },
    ).catch(error => console.log(`Login failed with error: ${error}`));
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.container}>
          <ImageBackground style={styles.imageStyle} source={talonImage}>
            <Text style={[styles.text, { textAlign: 'center' }]}>
             Log in to optimise user experience and personalise workout data
            </Text>
          </ImageBackground>
          <TouchableOpacity onPress={() => this.doFacebookSignUp()}>
            <View style={styles.fieldContainer}>
              <Icon name="facebook" type="entypo" color="white" />
              <Text style={styles.text}>
                Log in with Facebook
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.props.navigation.navigate('Login')}>
            <View style={[styles.fieldContainer, { backgroundColor: '#33425a' }]}>
              <Icon name="email-outline" type="material-community" color="white" />
              <Text style={styles.text}>
                Log in with Email
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.props.navigation.navigate('Signup')}>
            <View style={[styles.fieldContainer, { backgroundColor: '#D44A37' }]}>
              <Icon name="account" type="material-community" color="white" />
              <Text style={styles.text}>
                Create Account
              </Text>
            </View>
          </TouchableOpacity>
          {this.state.showLoading ? <Loading /> : null}
        </View>
      </View>
    );
  }
}
