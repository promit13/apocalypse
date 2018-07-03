import React from 'react';
import { StyleSheet, Text, ScrollView, Navigator } from 'react-native';
import t from 'tcomb-form-native';
import { Card, Button, SocialIcon } from 'react-native-elements';
import { AccessToken, LoginManager } from 'react-native-fbsdk';


import firebase from './../components/firebase';

const { Form } = t.form;

const User = t.struct({
  email: t.String,
  firstName: t.String,
  lastName: t.String,
  telephone: t.Number,
  password: t.String,
  passwordRepeat: t.String,
});

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    marginTop: 50,
    padding: 20,
    backgroundColor: '#ffffff',
    flexDirection: 'column',
    flex: 1,
  },
  button: {
    width: 50,
  },
});

const options = {
  fields: {
    email: {
      error: 'We need an email address to associate your account with',
      label: 'Email address',
    },
    password: {
      password: true,
      secureTextEntry: true,
      error: 'We need a password for your account',
    },
    passwordRepeat: {
      password: true,
      secureTextEntry: true,
      label: 'Confirm password',
      error: 'We need a password for your account',
    },
  },
};


async function logIn() {
  const { type, token } = await Expo.Facebook.logInWithReadPermissionsAsync('2138943709469344', {
    permissions: ['public_profile'],
  });
  if (type === 'success') {
    // const response = await fetch(`https://graph.facebook.com/me?access_token=${token}`);
    const credential = firebase.auth.FacebookAuthProvider.credential(token);
    return firebase.auth().signInWithCredential(credential);
  }
}

export default class Signup extends React.Component {
  handleSubmit = () => {
    // const { email, password } = this.state;
    const value = this.signup.getValue(); // use that ref to get the form value
    firebase.auth().createUserWithEmailAndPassword(value.email, value.password)
      .then((user) => {
        // console.log('registered', user);
        firebase.database().ref(`users/${user.uid}`).set({
          firstName: value.firstName,
          lastName: value.lastName,
          email: value.email,
          telephone: value.telephone,
        });
      })
      .catch((error) => error);
  }
  render() {
    return (
      <Card contentContainerStyle={styles.container}>
        <Text>Register</Text>
        <Form
          ref={c => this.signup = c}
          type={User}
          options={options}
        />
        <Button
          buttonStyle={{ marginTop: 20 }}
          title="Sign up"
          onPress={this.handleSubmit}
        />
        <Button
          buttonStyle={{ marginTop: 20 }}
          backgroundColor="transparent"
          textStyle={{ color: '#bcbec1' }}
          title="Sign in"


          onPress={() => this.props.navigation.navigate('Login')}
        />
        <SocialIcon
          title="Register"
          button
          onPress={logIn}
          buttonStyle={{ marginTop: 20 }}
          type="facebook"
        />
      </Card>
    );
  }
}

