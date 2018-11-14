import React from 'react';
import {
  View, TextInput, StyleSheet, Image, Dimensions, TouchableOpacity, StatusBar,
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
  }

  handleSubmit = () => {
    firebase.auth().signInWithEmailAndPassword(this.state.email, this.state.password)
      .then(() => {
        this.setState({ showError: false, showLoading: false });
      })
      .catch(() => {
        this.setState({ showError: true, showLoading: false });
      });
  }

  render() {
    return (
      <KeyboardAwareScrollView style={{ backgroundColor: '#001331' }} contentContainerStyle={styles.container} resetScrollToCoords={{ x: 0, y: 0 }}>
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
            onChangeText={email => this.setState({ email })}
            value={this.state.email}
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
            onChangeText={password => this.setState({ password })}
            value={this.state.password}
          />
        </View>
        <TouchableOpacity onPress={() => this.props.navigation.navigate('ForgotPassword')}>
          <Text style={[styles.text, { fontSize: 14, alignSelf: 'flex-end', marginTop: 5 }]}>
            Forgot Password
          </Text>
        </TouchableOpacity>
        {this.state.showError ? <ErrorMessage errorMessage="Incorrect username/password" /> : null}
        {this.state.showLoading ? <Loading /> : null}
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
      </KeyboardAwareScrollView>
    );
  }
}
