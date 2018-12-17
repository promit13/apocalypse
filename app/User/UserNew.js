import React from 'react';
import {
  StyleSheet, View, TextInput, ScrollView, TouchableOpacity, Image, Dimensions, StatusBar,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import {
  Button, Text, Icon, CheckBox,
} from 'react-native-elements';
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
    borderRadius: 5,
    borderColor: 'white',
    borderWidth: 1,
    marginTop: 5,
    padding: 10,
  },
  imageStyle: {
    height: imageSize,
    width: imageSize,
    alignSelf: 'center',
    marginTop: 50,
    marginBottom: 20,
  },
  line: {
    width: '100%',
    height: 1,
    backgroundColor: 'white',
  },
  inputStyle: {
    flex: 1,
    height: 40,
    color: 'white',
    marginLeft: 10,
    fontSize: 18,
    fontWeight: 'bold',
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
    console.log(currentUser);
    firebase.database().ref(`users/${currentUser.uid}`).set({
      firstName,
      lastName,
      email,
      tutorial: false,
      fullNameLowercase: `${firstName.toLowerCase()} ${lastName.toLocaleLowerCase()}`,
      purchases: '',
      lastPlayedEpisode: '',
      playedIntelArray: '',
      episodeCompletedArray: '',
      checked: false,
    })
      .then(() => {
        console.log('CHECK second');
        this.setState({ showError: false, errorMessage: '', showLoading: false });
        this.props.navigation.navigate('UserBodyDetail');
      })
      .catch(error => console.log(error));
  }

  handleSubmit = () => {
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      checked,
    } = this.state;
    if (email === '' || firstName === ''
      || lastName === '' || password === '' || confirmPassword === '') {
      return this.setState({ showError: true, errorMessage: 'Please fill all section', showLoading: false });
    }
    if (password !== confirmPassword) {
      return this.setState({ showError: true, errorMessage: 'Password did not match', showLoading: false });
    }
    if (!checked) {
      return this.setState({ showError: true, errorMessage: 'Please accept the User Agreements', showLoading: false });
    }
    firebase.auth().createUserWithEmailAndPassword(email, password)
      .then((currentUser) => {
        // firebase.auth().currentUser.sendEmailVerification()
        //   .then(() => {
        //     this.setUserData(currentUser);
        //   })
        //   .catch(err => console.log(err));
        this.setUserData(currentUser);
      })
      .catch((error) => {
        this.setState({ showError: true, errorMessage: error.message, showLoading: false });
      });
  }

  render() {
    const {
      email, firstName, lastName, password, confirmPassword, checked, showError, showLoading, errorMessage,
    } = this.state;
    return (
      <KeyboardAwareScrollView style={{ backgroundColor: '#001331' }} contentContainerStyle={styles.container} resetScrollToCoords={{ x: 0, y: 0 }}>
        <StatusBar backgroundColor="#00000b" barStyle="light-content" />
        <ScrollView>
          <Image style={styles.imageStyle} source={talonImage} />
          <View style={styles.fieldContainer} behavior="padding">
            <Icon name="email" color="white" size={16} />
            <TextInput
              keyboardType="email-address"
              underlineColorAndroid="transparent"
              style={styles.inputStyle}
              placeholder="Email"
              placeholderTextColor="gray"
              onChangeText={value => this.setState({ email: value })}
              value={email}
            />
          </View>
          <View style={styles.fieldContainer}>
            <Icon name="user" type="entypo" color="white" size={16} />
            <TextInput
              underlineColorAndroid="transparent"
              style={styles.inputStyle}
              placeholder="First Name"
              placeholderTextColor="gray"
              onChangeText={value => this.setState({ firstName: value })}
              value={firstName}
            />
          </View>
          <View style={styles.fieldContainer}>
            <Icon name="user" type="entypo" color="white" size={16} />
            <TextInput
              underlineColorAndroid="transparent"
              style={styles.inputStyle}
              placeholder="Last Name"
              placeholderTextColor="gray"
              onChangeText={value => this.setState({ lastName: value })}
              value={lastName}
            />
          </View>
          <View style={styles.fieldContainer}>
            <Icon name="lock" type="entypo" color="white" size={16} />
            <TextInput
              secureTextEntry
              underlineColorAndroid="transparent"
              style={styles.inputStyle}
              placeholder="Password"
              placeholderTextColor="gray"
              onChangeText={value => this.setState({ password: value })}
              value={password}
            />
          </View>
          <View style={styles.fieldContainer}>
            <Icon name="lock" type="entypo" color="white" size={16} />
            <TextInput
              secureTextEntry
              underlineColorAndroid="transparent"
              style={styles.inputStyle}
              placeholder="Confirm Password"
              placeholderTextColor="gray"
              onChangeText={value => this.setState({ confirmPassword: value })}
              value={confirmPassword}
            />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <CheckBox
              checked={checked}
              checkedColor="#f5cb23"
              containerStyle={{ backgroundColor: '#001331', borderColor: 'transparent', marginRight: -25 }}
              onIconPress={() => this.setState({ checked: !checked })}
            />
            <TouchableOpacity onPress={() => this.props.navigation.navigate('Agreement', {
              showCheckbox: false,
            })}
            >
              <View>
                <Text style={{ color: checked ? '#f5cb23' : 'white', fontWeight: 'bold' }}>
                  I agree to the User Agreement
                </Text>
                <View style={[styles.line, { backgroundColor: checked ? '#f5cb23' : 'white' }]} />
              </View>
            </TouchableOpacity>
          </View>
          {showError ? <ErrorMessage errorMessage={errorMessage} /> : null}
          {showLoading ? <Loading /> : null}
          <Button
            buttonStyle={styles.button}
            title="Sign up"
            onPress={() => {
              this.setState({ showLoading: true });
              this.handleSubmit();
            }
          }
          />
          {/* <SocialIcon
            title="Sign up With Facebook"
            button
            style={{ marginTop: 15 }}
            type="facebook"
            onPress={() => {
              this.setState({ showLoading: true });
              this.doFacebookSignUp();
            }}
          /> */}
        </ScrollView>
      </KeyboardAwareScrollView>
    );
  }
}
