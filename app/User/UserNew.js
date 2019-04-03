import React from 'react';
import {
  StyleSheet, View, TextInput, ScrollView, TouchableOpacity, Image, Dimensions, StatusBar,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import {
  Button, Text, Icon, CheckBox,
} from 'react-native-elements';
import { moderateScale } from 'react-native-size-matters';
import axios from 'axios';
import firebase from '../config/firebase';
import Loading from '../common/Loading';
import ErrorMessage from '../common/Error';
import ShowModal from '../common/ShowModal';

const { width } = Dimensions.get('window');
const imageSize = width - 120;

const talonImage = require('../../img/talon.png');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: moderateScale(10),
    backgroundColor: '#001331',
  },
  fieldContainer: {
    flexDirection: 'row',
    borderRadius: moderateScale(5),
    borderColor: 'white',
    borderWidth: moderateScale(1),
    marginTop: moderateScale(5),
    padding: moderateScale(10),
  },
  imageStyle: {
    height: moderateScale(imageSize, -0.2),
    width: moderateScale(imageSize, -0.2),
    alignSelf: 'center',
    marginTop: moderateScale(50),
    marginBottom: moderateScale(20),
  },
  line: {
    width: '100%',
    height: moderateScale(1),
    backgroundColor: 'white',
  },
  inputStyle: {
    flex: 1,
    height: moderateScale(40),
    color: 'white',
    marginLeft: moderateScale(10),
    fontSize: moderateScale(18),
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
    showModal: false,
    checkAgreement: false,
    checkMailing: false,

  }

  setUserData = (currentUser) => {
    const { firstName, lastName, email, checkAgreement, checkMailing } = this.state;
    console.log(currentUser);
    firebase.database().ref(`users/${currentUser.uid}`).set({
      firstName,
      lastName,
      email,
      tutorial: false,
      fullNameLowercase: `${firstName.toLowerCase()} ${lastName.toLocaleLowerCase()}`,
      acceptUserAgreement: checkAgreement,
      acceptMailingList: checkMailing,
    })
      .then(() => {
        this.setState({ showError: false, errorMessage: '', showLoading: false });
        // this.props.navigation.navigate('UserBodyDetail');
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
      checkAgreement,
    } = this.state;
    if (email === '' || firstName === ''
      || lastName === '' || password === '' || confirmPassword === '') {
      return this.setState({ showError: true, errorMessage: 'Please fill all section', showLoading: false });
    }
    if (password !== confirmPassword) {
      return this.setState({ showError: true, errorMessage: 'Password did not match', showLoading: false });
    }
    if (!checkAgreement) {
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
        axios.post('http://178.128.170.252/', { email });
      })
      .catch((error) => {
        this.setState({ showError: true, errorMessage: error.message, showLoading: false });
      });
  }

  render() {
    const {
      email, firstName, lastName, password, confirmPassword, checkAgreement, checkMailing, showError, showLoading, errorMessage, showModal,
    } = this.state;
    const { netInfo } = this.props.screenProps;
    return (
      <KeyboardAwareScrollView style={{ backgroundColor: '#001331' }} extraScrollHeight={0} contentContainerStyle={styles.container} resetScrollToCoords={{ x: 0, y: 0 }}>
        <StatusBar backgroundColor="#00000b" barStyle="light-content" />
        <ScrollView>
          <Image style={styles.imageStyle} source={talonImage} />
          <View style={styles.fieldContainer} behavior="padding">
            <Icon name="email" color="white" size={moderateScale(16)} />
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
            <Icon name="user" type="entypo" color="white" size={moderateScale(16)} />
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
            <Icon name="user" type="entypo" color="white" size={moderateScale(16)} />
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
            <Icon name="lock" type="entypo" color="white" size={moderateScale(16)} />
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
            <Icon name="lock" type="entypo" color="white" size={moderateScale(16)} />
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
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: -5, marginLeft: -15 }}>
            <CheckBox
              checked={checkAgreement}
              checkedColor="#f5cb23"
              size={moderateScale(25)}
              containerStyle={{ backgroundColor: '#001331', borderColor: 'transparent', marginRight: -25 }}
              onIconPress={() => this.setState({ checkAgreement: !checkAgreement })}
            />
            <TouchableOpacity onPress={() => {
              if (!netInfo) {
                return this.setState({ showModal: true });
              }
              this.props.navigation.navigate('Agreement', {
                showCheckbox: false,
              });
            }}
            >
              <View>
                <Text style={{ color: checkAgreement ? '#f5cb23' : 'white', fontWeight: 'bold', fontSize: moderateScale(12) }}>
                  I agree to the User Agreement
                </Text>
                <View style={[styles.line, { backgroundColor: checkAgreement ? '#f5cb23' : 'white' }]} />
              </View>
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: -20, marginLeft: -15 }}>
            <CheckBox
              checked={checkMailing}
              checkedColor="#f5cb23"
              size={moderateScale(25)}
              containerStyle={{ backgroundColor: '#001331', borderColor: 'transparent', marginRight: -25 }}
              onIconPress={() => this.setState({ checkMailing: !checkMailing })}
            />
            <TouchableOpacity onPress={() => {
              if (!netInfo) {
                return this.setState({ showModal: true });
              }
              this.setState({ checkMailing: !checkMailing });
            }}
            >
              <View>
                <Text style={{ color: checkMailing ? '#f5cb23' : 'white', flex: 1, fontWeight: 'bold', fontSize: moderateScale(12) }}>
                  I'd like to get occasional tips, news and updates from Imaginactive
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          {showError ? <ErrorMessage errorMessage={errorMessage} /> : null}
          {showLoading ? <Loading /> : null}
          <ShowModal
            visible={showModal}
            title="Please check your internet connection"
            buttonText="OK"
            onPress={() => {
              this.setState({ showModal: false });
            }}
          />
          <Button
            buttonStyle={styles.button}
            title="Sign up"
            fontSize={moderateScale(18)}
            onPress={() => {
              if (!netInfo) {
                return this.setState({ showModal: true });
              }
              this.setState({ showLoading: true });
              this.handleSubmit();
            }
          }
          />
          {/* <SocialIcon
            title="Sign up With Facebook"
            button
            style={{ marginTop: 15 }
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
