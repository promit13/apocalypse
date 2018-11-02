import React from 'react';
import {
  View, TextInput, StyleSheet, Alert,
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


export default class ForgotPassword extends React.Component {
  static navigationOptions = {
    title: 'Reset Password',
  };

  state = {
    email: '',
    showError: false,
    error: '',
    showLoading: false,
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
    return (
      <View style={styles.container}>
        <View style={styles.fieldContainer}>
          <Icon name="user" type="entypo" color="white" />
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
        {this.state.showError ? <ErrorMessage errorMessage={this.state.error} /> : null}
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
