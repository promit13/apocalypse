import React from 'react';
import {
  View, StyleSheet, TextInput, ScrollView, Text,
} from 'react-native';
import { Button } from 'react-native-elements';
import firebase from '../config/firebase';

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    marginTop: 50,
    padding: 20,
    backgroundColor: '#001331',
    flex: 1,
  },
  button: {
    width: 50,
  },
  inputStyle: {
    borderColor: 'white',
    borderRadius: 5,
    borderWidth: 2,
    padding: 10,
    height: 40,
    color: 'white',
    margin: 5,
  },
});

export default class UserBodyDetail extends React.Component {
  state = {
    height: '',
    weight: '',
    age: '',
    gender: '',
    errorVisible: false,
  }

  handleSubmit = () => {
    const {
      age,
      height,
      weight,
      gender,
    } = this.state;
    if (age === '' || height === '' || weight === '' || gender === '') {
      return this.setState({ errorVisible: true });
    }
    firebase.database().ref(`users/${this.props.screenProps.user.uid}`).update({
      age,
      weight,
      height,
      gender,
      extended: true,
    })
      .then(() => this.props.navigation.navigate('Tutorial'));
  }

  displayErrorText = () => {
    if (this.state.errorVisible) {
      return (
        <Text style={{ color: 'red' }}>
          Please fill all section
        </Text>
      );
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <ScrollView>
          <TextInput
            style={styles.inputStyle}
            placeholder="Age"
            placeholderTextColor="gray"
            onChangeText={age => this.setState({ age })}
            value={this.state.age}
          />
          <TextInput
            style={styles.inputStyle}
            placeholder="Height (cm/inches)"
            placeholderTextColor="gray"
            onChangeText={height => this.setState({ height })}
            value={this.state.height}
          />
          <TextInput
            style={styles.inputStyle}
            placeholder="Weight (kg/lbs)"
            placeholderTextColor="gray"
            onChangeText={weight => this.setState({ weight })}
            value={this.state.weight}
          />
          <TextInput
            style={styles.inputStyle}
            placeholder="Gender (M/F/Other)"
            placeholderTextColor="gray"
            onChangeText={gender => this.setState({ gender })}
            value={this.state.gender}
          />
          {this.displayErrorText()}
          <Button
            buttonStyle={{ backgroundColor: '#445878', borderRadius: 10, marginTop: 10 }}
            title="Done"
            onPress={() => this.handleSubmit()}
          />
          <Button
            buttonStyle={{ backgroundColor: 'transparent', borderRadius: 10, marginTop: 10 }}
            color="white"
            title="Skip Personalisation info"
            onPress={() => this.props.navigation.navigate('Tutorial')}
          />
        </ScrollView>
      </View>
    );
  }
}
