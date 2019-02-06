import React from 'react';
import {
  View, ImageBackground, StyleSheet, Dimensions, TouchableOpacity, StatusBar,
} from 'react-native';
import { Icon, Text } from 'react-native-elements';
import { moderateScale } from 'react-native-size-matters';
import Orientation from 'react-native-orientation';
import OfflineMsg from '../common/OfflineMsg';
import ShowModal from '../common/ShowModal';

const { width } = Dimensions.get('window');
const imageSize = width - 120;

const talonImage = require('../../img/talonLight.png');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: moderateScale(10),
    backgroundColor: '#001331',
  },
  fieldContainer: {
    flexDirection: 'row',
    backgroundColor: '#3C5A96',
    borderRadius: moderateScale(5),
    alignItems: 'center',
    padding: moderateScale(15),
    marginBottom: moderateScale(15),
  },
  inputStyle: {
    flex: 1,
    height: moderateScale(40),
    color: 'white',
    marginLeft: moderateScale(10),
    fontSize: moderateScale(20),
  },
  imageStyle: {
    height: moderateScale(imageSize, -0.2),
    width: moderateScale(imageSize, -0.2),
    alignSelf: 'center',
    marginTop: moderateScale(20),
    marginBottom: moderateScale(20),
    justifyContent: 'center',
    alignContent: 'center',
  },
  text: {
    fontWeight: 'bold',
    color: 'white',
    fontSize: moderateScale(20),
    marginLeft: moderateScale(15),
  },
  modal: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: moderateScale(10),
  },
  modalInnerView: {
    backgroundColor: '#f2f2f2',
    padding: moderateScale(10),
    justifyContent: 'center',
  },
});


export default class LoginSignUp extends React.Component {
  static navigationOptions = {
    header: null,
  };

  state = {
    showModal: false,
  }

  render() {
    const { showModal } = this.state;
    const { netInfo } = this.props.screenProps;
    Orientation.lockToPortrait();
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor="#00000b" barStyle="light-content" />
        { !netInfo ? <OfflineMsg /> : null }
        <ImageBackground style={styles.imageStyle} source={talonImage}>
          <Text style={[styles.text, { textAlign: 'center' }]}>
            {`Ok let's go!\nPlease log in to create a training account`}
          </Text>
        </ImageBackground>
        <ShowModal
          visible={showModal}
          title="Please check your internet connection"
          buttonText="OK"
          onPress={() => {
            this.setState({ showModal: false });
          }}
        />
        <TouchableOpacity onPress={() => {
          if (!netInfo) {
            return this.setState({ showModal: true });
          }
          this.props.navigation.navigate('Agreement', { showCheckbox: true });
        }}
        >
          <View style={styles.fieldContainer}>
            <Icon name="facebook" type="entypo" color="white" size={moderateScale(30)} />
            <Text style={styles.text}>
              Log in with Facebook
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {
          if (!netInfo) {
            return this.setState({ showModal: true });
          }
          this.props.navigation.navigate('Login');
        }}
        >
          <View style={[styles.fieldContainer, { backgroundColor: '#33425a' }]}>
            <Icon name="email-outline" type="material-community" color="white" size={moderateScale(30)} />
            <Text style={styles.text}>
              Log in with Email
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {
          if (!netInfo) {
            return this.setState({ showModal: true });
          }
          this.props.navigation.navigate('Signup');
        }}
        >
          <View style={[styles.fieldContainer, { backgroundColor: '#D44A37' }]}>
            <Icon name="account" type="material-community" color="white" size={moderateScale(30)} />
            <Text style={styles.text}>
              Create Account
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }
}
