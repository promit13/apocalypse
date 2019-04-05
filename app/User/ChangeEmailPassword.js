import React from 'react';
import {
  View, TextInput, StyleSheet, Alert, ScrollView, Platform, KeyboardAvoidingView,
} from 'react-native';
import { Button, Icon } from 'react-native-elements';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { moderateScale } from 'react-native-size-matters';
import firebase from '../config/firebase';
import Loading from '../common/Loading';
import ErrorMessage from '../common/Error';
import ShowModal from '../common/ShowModal';

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
    borderWidth: moderateScale(1),
    padding: moderateScale(10),
    marginTop: moderateScale(5),
  },
  inputStyle: {
    flex: 1,
    height: moderateScale(40),
    color: 'white',
    fontSize: moderateScale(12),
    marginLeft: moderateScale(10),
  },
  button: {
    width: '100%',
  },
});


export default class ChangeEmailPassword extends React.Component {
  static navigationOptions = {
    title: 'Change Password',
  };

  state = {
    password: '',
    newPassword: '',
    confirmPassword: '',
    showError: false,
    error: '',
    showLoading: false,
    showModal: false,
  }

  handleSubmit = async () => {
    const { password, newPassword, confirmPassword } = this.state;
    if (newPassword !== confirmPassword) {
      return this.setState({ showError: true, error: 'Password does not match', showLoading: false });
    }
    const user = firebase.auth().currentUser;
    const credentials = await firebase.auth.EmailAuthProvider.credential(
      user.email,
      password,
    );
    firebase.auth().currentUser.reauthenticateAndRetrieveDataWithCredential(credentials)
      .then(() => {
        user.updatePassword(newPassword)
          .then(() => {
            this.setState({ showError: false, showLoading: false });
            Alert.alert('Password changed successfully!');
            this.props.navigation.navigate('Account');
          }).catch(error => this.setState(
            { showError: true, error: error.message, showLoading: false },
          ));
      }).catch(() => this.setState({ showError: true, error: 'Incorrect password', showLoading: false }));
  }

  render() {
    const { showModal, showError, error } = this.state;
    const { netInfo } = this.props.screenProps;
    return (
      // <KeyboardAwareScrollView style={{ backgroundColor: '#001331' }} contentContainerStyle={styles.container} resetScrollToCoords={{ x: 0, y: 0 }}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'android' ? '' : 'padding'} enabled>
        <View style={styles.fieldContainer}>
          <Icon name="lock" type="entypo" color="white" size={moderateScale(30)}/>
          <TextInput
            underlineColorAndroid="transparent"
            style={styles.inputStyle}
            secureTextEntry
            placeholder="Current Password"
            placeholderTextColor="gray"
            onChangeText={password => this.setState({ password })}
            value={this.state.password}
          />
        </View>
        {showError ? <ErrorMessage errorMessage={error} /> : null}
        <ShowModal
          visible={showModal}
          title="Please check your internet connection"
          buttonText="OK"
          onPress={() => {
            this.setState({ showModal: false });
          }}
        />
        <View style={styles.fieldContainer}>
          <Icon name="lock" type="entypo" color="white" size={moderateScale(30)} />
          <TextInput
            underlineColorAndroid="transparent"
            secureTextEntry
            style={styles.inputStyle}
            placeholder="New Password"
            placeholderTextColor="gray"
            onChangeText={newPassword => this.setState({ newPassword })}
            value={this.state.newPassword}
          />
        </View>
        <View style={styles.fieldContainer}>
          <Icon name="lock" type="entypo" color="white" size={moderateScale(30)}/>
          <TextInput
            underlineColorAndroid="transparent"
            secureTextEntry
            style={styles.inputStyle}
            placeholder="Confirm Password"
            placeholderTextColor="gray"
            onChangeText={confirmPassword => this.setState({ confirmPassword })}
            value={this.state.confirmPassword}
          />
        </View>
        {this.state.showLoading ? <Loading /> : null}
        <Button
          buttonStyle={{ backgroundColor: '#445878', borderRadius: moderateScale(10), marginTop: moderateScale(10) }}
          fontSize={moderateScale(18)}
          title="Submit"
          onPress={() => {
            if (!netInfo) {
              return this.setState({ showModal: true });
            }
            this.setState({ showLoading: true });
            this.handleSubmit();
          }}
        />
      </KeyboardAvoidingView>
      // </KeyboardAwareScrollView>
    );
  }
}
