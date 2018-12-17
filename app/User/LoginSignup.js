import React from 'react';
import {
  View, ImageBackground, StyleSheet, Dimensions, TouchableOpacity, StatusBar,
} from 'react-native';
import { Icon, Text } from 'react-native-elements';
import Orientation from 'react-native-orientation';

const { width } = Dimensions.get('window');
const imageSize = width - 120;

const talonImage = require('../../img/talonLight.png');

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
  modal: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  modalInnerView: {
    backgroundColor: '#f2f2f2',
    padding: 10,
    justifyContent: 'center',
  },
});


export default class Login extends React.Component {
  static navigationOptions = {
    header: null,
  };

  render() {
    Orientation.lockToPortrait();
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor="#00000b" barStyle="light-content" />
        <ImageBackground style={styles.imageStyle} source={talonImage}>
          <Text style={[styles.text, { textAlign: 'center' }]}>
            {`Ok let's go!\nPlease log in to create a training account`}
          </Text>
        </ImageBackground>
        
        <TouchableOpacity onPress={() => this.props.navigation.navigate('Agreement', { showCheckbox: true })}>
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
      </View>
    );
  }
}
