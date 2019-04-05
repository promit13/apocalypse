import React from 'react';
import {
  View, TextInput, StyleSheet, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Button, Icon } from 'react-native-elements';
import { moderateScale } from 'react-native-size-matters';
import firebase from '../config/firebase';
import Loading from '../common/Loading';
import ErrorMessage from '../common/Error';
import ShowModal from '../common/ShowModal';

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
    borderWidth: 1,
    padding: 10,
    marginTop: 5,
  },
  inputStyle: {
    flex: 1,
    height: moderateScale(40),
    color: 'white',
    marginLeft: moderateScale(10),
    fontSize: moderateScale(18),
  },
});


export default class ForgotPassword extends React.Component {
  static navigationOptions = {
    title: 'Reset Password',
  };

  state = {
    email: '',
    showError: false,
    error: '',
    showLoading: false,
    showModal: false,
  }

  handleSubmit = async () => {
    const { email } = this.state;
    if (email === '') {
      return this.setState({ showError: true, error: 'Please enter your email', showLoading: false });
    }
    firebase.auth().sendPasswordResetEmail(email).then(() => {
      this.setState({ showLoading: false });
      this.props.navigation.navigate('Login');
      Alert.alert('Password reset link has been sent to your email');
    }).catch((error) => {
      this.setState({ showLoading: false });
      Alert.alert(error.message);
    });
  }

  render() {
    const {
      showModal, showError, error, showLoading,
    } = this.state;
    const { netInfo } = this.props.screenProps;
    return (
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'android' ? '' : 'padding'} enabled>
        <View style={styles.fieldContainer}>
          <Icon name="user" type="entypo" color="white" size={moderateScale(16)} />
          <TextInput
            underlineColorAndroid="transparent"
            style={styles.inputStyle}
            keyboardType="email-address"
            placeholder="Enter your email"
            placeholderTextColor="gray"
            onChangeText={email => this.setState({ email })}
            value={this.state.email}
          />
        </View>
        {showError ? <ErrorMessage errorMessage={error} /> : null}
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
          buttonStyle={{ backgroundColor: '#445878', borderRadius: moderateScale(10), marginTop: moderateScale(10) }}
          title="Submit"
          fontSize={moderateScale(18)}
          onPress={() => {
            if (!netInfo) {
              return this.setState({ showModal: true });
            }
            this.setState({ showLoading: true });
            this.handleSubmit();
          }}
        />
      </KeyboardAvoidingView>
    );
  }
}
