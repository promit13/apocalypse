import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Button, Icon } from 'react-native-elements';
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
    padding: 10,
  },
  inputStyle: {
    flex: 1,
    height: 40,
    color: 'white',
    marginLeft: 10,
  },
  button: {
    width: 50,
  },
});


export default class Login extends React.Component {
  state = {
    email: '',
    password: '',
  }

  handleSubmit = () => {
    firebase.auth().signInWithEmailAndPassword(this.state.email, this.state.password)
      .then((user) => {
        console.log(user);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.fieldContainer}>
          <Icon name="user" type="entypo" color="white" />
          <TextInput
            style={styles.inputStyle}
            placeholder="Email"
            placeholderTextColor="white"
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
            placeholderTextColor="white"
            onChangeText={password => this.setState({ password })}
            value={this.state.password}
          />
        </View>
        <Button
          buttonStyle={{ backgroundColor: '#445878', borderRadius: 10, marginTop: 10 }}
          title="Log in"
          onPress={() => this.handleSubmit()}
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
