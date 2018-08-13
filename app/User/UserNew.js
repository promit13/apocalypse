import React from 'react';
import {
  StyleSheet, View, TextInput, ScrollView, Text,
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
    marginTop: 10,
  },
});

export default class Signup extends React.Component {
  state = {
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    confirmPassword: '',
    errorVisible: false,
    errorMessage: '',
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
      return this.setState({ errorVisible: true, errorMessage: 'Please fill all section' });
    }
    if (password !== confirmPassword) {
      return this.setState({ errorVisible: true, errorMessage: 'Password did not match' });
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
          gender: '',
          extended: false,
          tutorial: false,
          fullNameLowercase: `${firstName.toLowerCase()} ${lastName.toLocaleLowerCase()}`,
        })
          .then(() => {
            this.setState({ errorVisible: false, errorMessage: '' });
            this.props.navigation.navigate('UserBodyDetail');
          });
      });
  }

  displayErrorText = () => {
    if (this.state.errorVisible) {
      return (
        <Text style={{ color: 'red', marginLeft: 10, marginTop: 10 }}>
          {this.state.errorMessage}
        </Text>
      );
    }
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
              placeholderTextColor="gray"
              onChangeText={email => this.setState({ email })}
              value={this.state.email}
            />
          </View>
          <View style={styles.fieldContainer}>
            <Icon name="user" type="entypo" color="white" />
            <TextInput
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
              style={styles.inputStyle}
              placeholder="Confirm Password"
              placeholderTextColor="gray"
              onChangeText={confirmPassword => this.setState({ confirmPassword })}
              value={this.state.confirmPassword}
            />
          </View>
          {this.displayErrorText()}
          <Button
            buttonStyle={styles.button}
            title="Sign up"
            onPress={() => this.handleSubmit()}
          />
          <Button
            buttonStyle={styles.button}
            textStyle={{ color: '#bcbec1' }}
            title="Sign in"
            onPress={() => this.props.navigation.navigate('Login')}
          />
          <SocialIcon
            title="Register"
            button
            buttonStyle={{ marginTop: 10 }}
            type="facebook"
            onPress={() => this.props.navigation.navigate('UserBodyDetail')}
          />

          <Button
            buttonStyle={{ marginTop: 20 }}
            backgroundColor="transparent"
            textStyle={{ color: '#bcbec1' }}
            title="Logout / debug"
            onPress={() => this.props.navigation.navigate('Tutorial')}
          />
        </ScrollView>
      </View>
    );
  }
}
