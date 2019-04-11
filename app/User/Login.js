import React from 'react';
import {
  View, TextInput, StyleSheet, Image, Dimensions,
  TouchableOpacity, StatusBar, ScrollView,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Button, Icon, Text } from 'react-native-elements';
import { moderateScale } from 'react-native-size-matters';
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
    borderRadius: moderateScale(10),
    borderColor: 'white',
    borderWidth: moderateScale(2),
    padding: moderateScale(10),
    marginTop: moderateScale(5),
  },
  inputStyle: {
    flex: 1,
    height: moderateScale(40),
    color: 'white',
    marginLeft: moderateScale(10),
    fontSize: moderateScale(18),
    fontWeight: 'bold',
  },
  imageStyle: {
    height: moderateScale(imageSize, -0.2),
    width: moderateScale(imageSize, -0.2),
    alignSelf: 'center',
    marginTop: moderateScale(20),
    marginBottom: moderateScale(20),
  },
  text: {
    color: 'white',
    fontSize: moderateScale(18),
    fontWeight: 'bold',
  },
});


export default class Login extends React.Component {
  static navigationOptions = {
    title: 'Login',
  };

  state = {
    email: '',
    password: '',
    showError: false,
    showLoading: false,
    errorMessage: '',
    showModal: false,
  }

  handleSubmit = () => {
    firebase.auth().signInWithEmailAndPassword(this.state.email, this.state.password)
      .then(() => {
        this.setState({ showError: false, showLoading: false });
      })
      .catch((error) => {
        console.log(error);
        const errorMessage = error.code === 'auth/wrong-password'
          ? 'The password is incorrect or the email is associated with a Facebook account.'
          : 'Please enter valid email address';
        this.setState({ showError: true, showLoading: false, errorMessage });
      });
  }

  render() {
    const {
      email, password, showError, showLoading, errorMessage, showModal,
    } = this.state;
    const { netInfo } = this.props.screenProps;
    return (
      // <KeyboardAwareScrollView style={{ backgroundColor: '#001331' }} contentContainerStyle={styles.container} resetScrollToCoords={{ x: 0, y: 0 }}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'android' ? '' : 'padding'} enabled>
        <ScrollView>
          <StatusBar backgroundColor="#00000b" barStyle="light-content" />
          <Image style={styles.imageStyle} source={talonImage} />
          <View style={[styles.fieldContainer, { paddingTop: moderateScale(20), paddingBottom: moderateScale(20) }]}>
            <Text style={styles.text}>
              AGENT: Whiskey Gambit
            </Text>
          </View>
          <View style={styles.fieldContainer}>
            <Icon name="user" type="entypo" color="white" size={moderateScale(16)} />
            <TextInput
              keyboardType="email-address"
              underlineColorAndroid="transparent"
              placeholder="Email"
              style={styles.inputStyle}
              placeholderTextColor="gray"
              onChangeText={emailInput => this.setState({ email: emailInput })}
              value={email}
            />
          </View>
          <View style={styles.fieldContainer}>
            <Icon name="lock" type="entypo" color="white" size={moderateScale(16)} />
            <TextInput
              underlineColorAndroid="transparent"
              secureTextEntry
              style={styles.inputStyle}
              placeholder="Password"
              placeholderTextColor="gray"
              onChangeText={passwordInput => this.setState({ password: passwordInput })}
              value={password}
            />
          </View>
          <TouchableOpacity onPress={() => {
            if (!netInfo) {
              return this.setState({ showModal: true });
            }
            this.props.navigation.navigate('ForgotPassword');
          }}
          >
            <Text style={[styles.text, { fontSize: moderateScale(14), alignSelf: 'flex-end', marginTop: moderateScale(5) }]}>
              Forgot Password
            </Text>
          </TouchableOpacity>
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
            buttonStyle={{ backgroundColor: '#445878', borderRadius: moderateScale(5), marginTop: moderateScale(10) }}
            title="Log in"
            fontSize={moderateScale(18)}
            onPress={() => {
              if (!netInfo) {
                return this.setState({ showModal: true });
              }
              this.setState({ showLoading: true });
              this.handleSubmit();
              // this.props.navigation.navigate('UserBodyDetail');
            }}
          />
          {/* <Button
            buttonStyle={{ backgroundColor: '#fff', borderRadius: 5, marginTop: 10 }}
            color="#001331"
            title="Create Account"
            onPress={() => this.props.navigation.navigate('Signup')}
          /> */}
        </ScrollView>
      </KeyboardAvoidingView>
      // </KeyboardAwareScrollView>
    );
  }
}
