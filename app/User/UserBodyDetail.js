import React from 'react';
import {
  View, StyleSheet, TextInput, ScrollView, Image, Dimensions,
} from 'react-native';
import { Button } from 'react-native-elements';
import firebase from '../config/firebase';
import Loading from '../common/Loading';
import ErrorMessage from '../common/Error';

const { width } = Dimensions.get('window');
const imageSize = width - 120;

const talonImage = require('../../img/talon.png');

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
  fieldContainer: {
    flexDirection: 'row',
    borderRadius: 10,
    borderColor: 'white',
    borderWidth: 2,
    padding: 10,
    marginTop: 5,
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
  imageStyle: {
    height: imageSize,
    width: imageSize,
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
});

export default class UserBodyDetail extends React.Component {
  static navigationOptions = {
    header: null,
  };

  state = {
    height: '',
    weight: '',
    age: '',
    gender: '',
    showError: false,
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
      return this.setState({ showError: true, showLoading: false });
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
        // this.props.navigation.navigate('Tutorial', { showButton: true });
      });
  }

  render() {
    const {
      age, height, weight, gender, showError, showLoading,
    } = this.state;
    return (
      <View style={styles.container}>
        <ScrollView>
          <Image style={styles.imageStyle} source={talonImage} />
          <TextInput
            keyboardType="numeric"
            underlineColorAndroid="transparent"
            style={styles.inputStyle}
            placeholder="Age"
            placeholderTextColor="gray"
            onChangeText={value => this.setState({ age: value })}
            value={age}
          />
          <TextInput
            keyboardType="numeric"
            underlineColorAndroid="transparent"
            style={styles.inputStyle}
            placeholder="Height (cm/inches)"
            placeholderTextColor="gray"
            onChangeText={value => this.setState({ height: value })}
            value={height}
          />
          <TextInput
            keyboardType="numeric"
            underlineColorAndroid="transparent"
            style={styles.inputStyle}
            placeholder="Weight (kg/lbs)"
            placeholderTextColor="gray"
            onChangeText={value => this.setState({ weight: value })}
            value={weight}
          />
          <TextInput
            underlineColorAndroid="transparent"
            style={styles.inputStyle}
            placeholder="Gender (M/F/Other)"
            placeholderTextColor="gray"
            onChangeText={value => this.setState({ gender: value })}
            value={gender}
          />
          {showError ? <ErrorMessage errorMessage="Please fill all section" /> : null}
          {showLoading ? <Loading /> : null}
          <Button
            buttonStyle={{ backgroundColor: '#445878', borderRadius: 10, marginTop: 10 }}
            title="Done"
            onPress={() => {
              this.setState({ showLoading: true });
              this.handleSubmit();
            }}
          />
          <Button
            buttonStyle={{ backgroundColor: 'transparent', borderRadius: 5, marginTop: 10 }}
            color="white"
            title="Skip Personalisation info"
            onPress={() => this.props.navigation.navigate('Tutorial')}
          />
        </ScrollView>
      </View>
    );
  }
}
