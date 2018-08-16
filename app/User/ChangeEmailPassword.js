import React from 'react';
import {
  View, TextInput, StyleSheet,
} from 'react-native';
import { Button, Icon } from 'react-native-elements';
import firebase from '../config/firebase';
import Loading from '../common/Loading';
import ErrorMessage from '../common/Error';

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
    height: 40,
    color: 'white',
    marginLeft: 10,
  },
  button: {
    width: '100%',
  },
});


export default class Login extends React.Component {
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
            this.props.navigation.navigate('Account');
          }).catch(error => this.setState(
            { showError: true, error: error.message, showLoading: false },
          ));
      }).catch(() => this.setState({ showError: true, error: 'Incorrect password', showLoading: false }));
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.fieldContainer}>
          <Icon name="lock" type="entypo" color="white" />
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
        {this.state.showError ? <ErrorMessage errorMessage={this.state.error} /> : null}
        <View style={styles.fieldContainer}>
          <Icon name="lock" type="entypo" color="white" />
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
          <Icon name="lock" type="entypo" color="white" />
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
          buttonStyle={{ backgroundColor: '#445878', borderRadius: 10, marginTop: 10 }}
          title="Submit"
          onPress={() => {
            this.setState({ showLoading: true });
            this.handleSubmit();
          }}
        />
      </View>
    );
  }
}
