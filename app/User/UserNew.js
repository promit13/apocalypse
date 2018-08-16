import React from 'react';
import {
  StyleSheet, View, TextInput, ScrollView,
} from 'react-native';
import { Button, SocialIcon, Icon } from 'react-native-elements';
import { LoginManager, AccessToken } from 'react-native-fbsdk';
import axios from 'axios';
import firebase from '../config/firebase';
import Loading from '../common/Loading';
import ErrorMessage from '../common/Error';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#001331',
  },
  fieldContainer: {
    flexDirection: 'row',
    borderRadius: 5,
    borderColor: 'white',
    borderWidth: 1,
    marginTop: 5,
    padding: 10,
  },
  inputStyle: {
    flex: 1,
    height: 40,
    color: 'white',
    marginLeft: 10,
  },
  button: {
    width: '100%',
    backgroundColor: '#445878',
    borderRadius: 10,
    marginTop: 20,
  },
});

export default class Signup extends React.Component {
  static navigationOptions = {
    title: 'Sign Up',
  };

  state = {
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    confirmPassword: '',
    showError: false,
    errorMessage: '',
    showLoading: false,
  }

  setUserData = (currentUser) => {
    const { firstName, lastName, email } = this.state;
    firebase.database().ref(`users/${currentUser.user.uid}`).set({
      firstName,
      lastName,
      email,
      age: 0,
      weight: 0,
      height: 0,
      gender: '',
      extended: false,
      tutorial: false,
      fullNameLowercase: `${firstName.toLowerCase()} ${lastName.toLocaleLowerCase()}`,
    })
      .then(() => {
        this.setState({ showError: false, errorMessage: '', showLoading: false });
        this.props.navigation.navigate('UserBodyDetail');
      });
  }

  handleSubmit = () => {
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
    } = this.state;
    if (email === '' || firstName === ''
      || lastName === '' || password === '' || confirmPassword === '') {
      return this.setState({ showError: true, errorMessage: 'Please fill all section', showLoading: false });
    }
    if (password !== confirmPassword) {
      return this.setState({ showError: true, errorMessage: 'Password did not match', showLoading: false });
    }
    firebase.auth().createUserWithEmailAndPassword(email, password)
      .then((currentUser) => {
        this.setUserData(currentUser);
      })
      .catch(error => this.setState({ showError: true, errorMessage: error.message, showLoading: false }));
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
                const { email, first_name, last_name } = response.data;
                this.setState({ email, firstName: first_name, lastName: last_name });
                const credential = firebase.auth.FacebookAuthProvider.credential(data.accessToken);
                firebase.auth().signInAndRetrieveDataWithCredential(credential)
                  .then((currentUser) => {
                    this.setUserData(currentUser);
                  })
                  .catch(error => console.log(error));
              });
            });
        }
      },
    ).catch(error => console.log(`Login failed with error: ${error}`));
  }

  render() {
    return (
      <View style={styles.container}>
        <ScrollView>
          <View style={styles.fieldContainer}>
            <Icon name="email" color="white" />
            <TextInput
              keyboardType="email-address"
              underlineColorAndroid="transparent"
              style={styles.inputStyle}
              placeholder="Email"
              placeholderTextColor="gray"
              onChangeText={email => this.setState({ email })}
              value={this.state.email}
            />
          </View>
          <View style={styles.fieldContainer}>
            <Icon name="user" type="entypo" color="white" />
            <TextInput
              underlineColorAndroid="transparent"
              style={styles.inputStyle}
              placeholder="First Name"
              placeholderTextColor="gray"
              onChangeText={firstName => this.setState({ firstName })}
              value={this.state.firstName}
            />
          </View>
          <View style={styles.fieldContainer}>
            <Icon name="user" type="entypo" color="white" />
            <TextInput
              underlineColorAndroid="transparent"
              style={styles.inputStyle}
              placeholder="Last Name"
              placeholderTextColor="gray"
              onChangeText={lastName => this.setState({ lastName })}
              value={this.state.lastName}
            />
          </View>
          <View style={styles.fieldContainer}>
            <Icon name="lock" type="entypo" color="white" />
            <TextInput
              secureTextEntry
              underlineColorAndroid="transparent"
              style={styles.inputStyle}
              placeholder="Password"
              placeholderTextColor="gray"
              onChangeText={password => this.setState({ password })}
              value={this.state.password}
            />
          </View>
          <View style={styles.fieldContainer}>
            <Icon name="lock" type="entypo" color="white" />
            <TextInput
              secureTextEntry
              underlineColorAndroid="transparent"
              style={styles.inputStyle}
              placeholder="Confirm Password"
              placeholderTextColor="gray"
              onChangeText={confirmPassword => this.setState({ confirmPassword })}
              value={this.state.confirmPassword}
            />
          </View>
          {this.state.showError ? <ErrorMessage errorMessage={this.state.errorMessage} /> : null}
          {this.state.showLoading ? <Loading /> : null}
          <Button
            buttonStyle={styles.button}
            title="Sign up"
            onPress={() => {
              this.setState({ showLoading: true });
              this.handleSubmit();
            }
          }
          />
          <SocialIcon
            title="Sign up With Facebook"
            button
            style={{ marginTop: 15 }}
            type="facebook"
            onPress={() => {
              this.setState({ showLoading: true });
              this.doFacebookSignUp();
            }}
          />
        </ScrollView>
      </View>
    );
  }
}
