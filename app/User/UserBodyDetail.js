import React from 'react';
import {
  View, StyleSheet, TextInput, ScrollView, Text, ActivityIndicator,
} from 'react-native';
import { Button } from 'react-native-elements';
import firebase from '../config/firebase';

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
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
    showLoading: false,
  }

  handleSubmit = () => {
    const {
      age,
      height,
      weight,
      gender,
    } = this.state;
    if (age === '' || height === '' || weight === '' || gender === '') {
      return this.setState({ errorVisible: true, showLoading: false });
    }
    firebase.database().ref(`users/${this.props.screenProps.user.uid}`).update({
      age,
      weight,
      height,
      gender,
      extended: true,
    })
      .then(() => {
        this.setState({ showLoading: false });
        this.props.navigation.navigate('Tutorial');
      });
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

  showLoading = () => {
    if (this.state.showLoading) {
      return <ActivityIndicator size="large" color="white" style={{ marginTop: 20 }} />;
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <ScrollView>
          <TextInput
            underlineColorAndroid="transparent"
            style={styles.inputStyle}
            placeholder="Age"
            placeholderTextColor="gray"
            onChangeText={age => this.setState({ age })}
            value={this.state.age}
          />
          <TextInput
            underlineColorAndroid="transparent"
            style={styles.inputStyle}
            placeholder="Height (cm/inches)"
            placeholderTextColor="gray"
            onChangeText={height => this.setState({ height })}
            value={this.state.height}
          />
          <TextInput
            underlineColorAndroid="transparent"
            style={styles.inputStyle}
            placeholder="Weight (kg/lbs)"
            placeholderTextColor="gray"
            onChangeText={weight => this.setState({ weight })}
            value={this.state.weight}
          />
          <TextInput
            underlineColorAndroid="transparent"
            style={styles.inputStyle}
            placeholder="Gender (M/F/Other)"
            placeholderTextColor="gray"
            onChangeText={gender => this.setState({ gender })}
            value={this.state.gender}
          />
          {this.displayErrorText()}
          {this.showLoading()}
          <Button
            buttonStyle={{ backgroundColor: '#445878', borderRadius: 10, marginTop: 10 }}
            title="Done"
            onPress={() => {
              this.setState({ showLoading: true });
              this.handleSubmit();
            }}
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
