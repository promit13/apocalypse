import React from 'react';
import {
  View, TextInput, StyleSheet, Text,
} from 'react-native';
import { Button, Icon, SocialIcon } from 'react-native-elements';
import { LoginManager, AccessToken } from 'react-native-fbsdk';
import firebase from './config/firebase';

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
  },
  button: {
    width: '100%',
  },
});


export default class Login extends React.Component {
  state = {
    email: '',
    password: '',
    errorVisible: false,
  }

  handleSubmit = () => {
    firebase.auth().signInWithEmailAndPassword(this.state.email, this.state.password)
      .then(() => {
        this.setState({ errorVisible: false });
      })
      .catch(() => {
        this.setState({ errorVisible: true });
      });
  }

  displayErrorText = () => {
    if (this.state.errorVisible) {
      return (
        <Text style={{ color: 'red', marginLeft: 10, marginTop: 10 }}>
          Invalid username/password
        </Text>
      );
    }
  }

  doLogin = () => {
    LoginManager.logInWithReadPermissions(['public_profile', 'email', 'user_gender']).then(
      (result) => {
        if (result.isCancelled) {
          console.log('Login was cancelled');
        } else {
          AccessToken.getCurrentAccessToken()
            .then((data) => {
              console.log(data);
              const credential = firebase.auth.FacebookAuthProvider.credential(data.accessToken);
              firebase.auth().signInAndRetrieveDataWithCredential(credential)
                .then(() => {
                  console.log(`Login was successful with permissions: 
                  ${result.grantedPermissions.toString()}`);
                })
                .catch(error => console.log(error));
            });
        }
      },
    ).catch(error => console.log(`Login failed with error: ${error}`));
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.fieldContainer}>
          <Icon name="user" type="entypo" color="white" />
          <TextInput
            style={styles.inputStyle}
            placeholder="Email"
            placeholderTextColor="gray"
            onChangeText={email => this.setState({ email })}
            value={this.state.email}
          />
        </View>
        <View style={styles.fieldContainer}>
          <Icon name="lock" type="entypo" color="white" />
          <TextInput
            secureTextEntry
            style={styles.inputStyle}
            placeholder="Password"
            placeholderTextColor="gray"
            onChangeText={password => this.setState({ password })}
            value={this.state.password}
          />
        </View>
        {this.displayErrorText()}
        <Button
          buttonStyle={{ backgroundColor: '#445878', borderRadius: 10, marginTop: 10 }}
          title="Log in"
          onPress={() => this.handleSubmit()}
        />
        <SocialIcon
          button
          style={{ marginTop: 10 }}
          type="facebook"
          title="Login with Facebook"
          onPress={() => this.doLogin()}
        />
        <Button
          buttonStyle={{ backgroundColor: '#fff', borderRadius: 10, marginTop: 10 }}
          color="#001331"
          title="Create Account"
          onPress={() => this.props.navigation.navigate('Signup')}
        />
      </View>
    );
  }
}
