import React from 'react';
import {
  View, TextInput, StyleSheet, Image, Dimensions, TouchableOpacity, StatusBar, ScrollView,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Button, Icon, Text } from 'react-native-elements';
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
    borderRadius: 10,
    borderColor: 'white',
    borderWidth: 2,
    padding: 10,
    marginTop: 5,
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
  },
  imageStyle: {
    height: imageSize,
    width: imageSize,
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  text: {
    color: 'white',
    fontSize: 18,
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
  }

  handleSubmit = () => {
    firebase.auth().signInWithEmailAndPassword(this.state.email, this.state.password)
      .then(() => {
        this.setState({ showError: false, showLoading: false });
      })
      .catch((error) => {
        const errorMessage = error.code === 'auth/wrong-password'
          ? 'Please enter valid password'
          : 'Please enter valid email address';
        this.setState({ showError: true, showLoading: false, errorMessage });
      });
  }

  render() {
    const {
      email, password, showError, showLoading, errorMessage,
    } = this.state;
    return (
      <KeyboardAwareScrollView style={{ backgroundColor: '#001331' }} contentContainerStyle={styles.container} resetScrollToCoords={{ x: 0, y: 0 }}>
        <ScrollView>
          <StatusBar backgroundColor="#00000b" barStyle="light-content" />
          <Image style={styles.imageStyle} source={talonImage} />
          <View style={[styles.fieldContainer, { paddingTop: 20, paddingBottom: 20 }]}>
            <Text style={styles.text}>
              AGENT: Whiskey Gambit
            </Text>
          </View>
          <View style={styles.fieldContainer}>
            <Icon name="user" type="entypo" color="white" size={16} />
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
            <Icon name="lock" type="entypo" color="white" size={16} />
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
          <TouchableOpacity onPress={() => this.props.navigation.navigate('ForgotPassword')}>
            <Text style={[styles.text, { fontSize: 14, alignSelf: 'flex-end', marginTop: 5 }]}>
              Forgot Password
            </Text>
          </TouchableOpacity>
          {showError ? <ErrorMessage errorMessage={errorMessage} /> : null}
          {showLoading ? <Loading /> : null}
          <Button
            buttonStyle={{ backgroundColor: '#445878', borderRadius: 5, marginTop: 10 }}
            title="Log in"
            onPress={() => {
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
      </KeyboardAwareScrollView>
    );
  }
}
