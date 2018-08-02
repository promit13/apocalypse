import React from 'react';
import {
  StyleSheet, View, TextInput, ScrollView,
} from 'react-native';
import { Button, SocialIcon, Icon } from 'react-native-elements';
import firebase from '../config/firebase';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#001331',
  },
  fieldContainer: {
    flexDirection: 'row',
    borderRadius: 10,
    borderColor: 'white',
    padding: 10,
  },
  inputStyle: {
    flex: 1,
    height: 40,
    color: 'white',
    marginLeft: 10,
  },
  button: {
    width: 50,
  },
});

export default class Signup extends React.Component {
  state = {
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    confirmPassword: '',
  }

  handleSubmit = () => {
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
    } = this.state;
    if (password !== confirmPassword) {
      return this.setState({ confirmPassword: 'Password did not match' });
    }
    firebase.auth().createUserWithEmailAndPassword(email, password)
      .then((currentUser) => {
        firebase.database().ref(`users/${currentUser.user.uid}`).set({
          firstName,
          lastName,
          email,
          age: 0,
          weight: 0,
          height: 0,
          extended: false,
          tutorial: false,
        })
          .then(() => {
            this.props.navigation.navigate('UserBodyDetail');
          });
      });
  }

  render() {
    return (
      <View style={styles.container}>
        <ScrollView>
          <View style={styles.fieldContainer}>
            <Icon name="email" color="white" />
            <TextInput
              style={styles.inputStyle}
              placeholder="Email"
              placeholderTextColor="white"
              onChangeText={email => this.setState({ email })}
              value={this.state.email}
            />
          </View>
          <View style={styles.fieldContainer}>
            <Icon name="user" type="entypo" color="white" />
            <TextInput
              style={styles.inputStyle}
              placeholder="First Name"
              placeholderTextColor="white"
              onChangeText={firstName => this.setState({ firstName })}
              value={this.state.firstName}
            />
          </View>
          <View style={styles.fieldContainer}>
            <Icon name="user" type="entypo" color="white" />
            <TextInput
              style={styles.inputStyle}
              placeholder="Last Name"
              placeholderTextColor="white"
              onChangeText={lastName => this.setState({ lastName })}
              value={this.state.lastName}
            />
          </View>
          <View style={styles.fieldContainer}>
            <Icon name="lock" type="entypo" color="white" />
            <TextInput
              secureTextEntry
              style={styles.inputStyle}
              placeholder="Password"
              placeholderTextColor="white"
              onChangeText={password => this.setState({ password })}
              value={this.state.password}
            />
          </View>
          <View style={styles.fieldContainer}>
            <Icon name="lock" type="entypo" color="white" />
            <TextInput
              secureTextEntry
              style={styles.inputStyle}
              placeholder="Confirm Password"
              placeholderTextColor="white"
              onChangeText={confirmPassword => this.setState({ confirmPassword })}
              value={this.state.confirmPassword}
            />
          </View>
          <Button
            buttonStyle={{ backgroundColor: '#445878', borderRadius: 10, marginTop: 10 }}
            title="Sign up"
            onPress={() => this.handleSubmit()}
          />
          <Button
            buttonStyle={{ backgroundColor: '#445878', borderRadius: 10, marginTop: 10 }}
            backgroundColor="transparent"
            textStyle={{ color: '#bcbec1' }}
            title="Sign in"
            onPress={() => this.props.navigation.navigate('Login')}
          />
          <SocialIcon
            title="Register"
            button
            buttonStyle={{ marginTop: 10 }}
            type="facebook"
            onPress={this.handleFacebookLogin}
          />

          <Button
            buttonStyle={{ marginTop: 20 }}
            backgroundColor="transparent"
            textStyle={{ color: '#bcbec1' }}
            title="Logout / debug"
            onPress={() => firebase.auth().signOut()}
          />
        </ScrollView>
      </View>
    );
  }
}
