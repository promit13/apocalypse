import React from 'react';
import {
  View, StyleSheet, TextInput, ScrollView, Image, Dimensions, Picker, Alert,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import ModalDropdown from 'react-native-modal-dropdown';
import { Button, Text } from 'react-native-elements';
import firebase from '../config/firebase';
import Loading from '../common/Loading';
import ErrorMessage from '../common/Error';

const ageArray = ['1', '2', '3', '4', '5', '6', '7', '8', '9',
  '10', '11', '12', '13', '14', '15', '16', '17', '18', '19',
  '20', '21', '22', '23', '24', '25', '26', '27', '28', '29',
  '30', '31', '32', '33', '34', '35', '36', '37', '38', '39',
  '40', '41', '42', '43', '44', '45', '46', '47', '48', '49',
  '50', '51', '52', '53', '54', '55', '56', '57', '58', '59',
  '60', '61', '62', '63', '64', '65', '66', '67', '68', '69',
  '70', '71', '72', '73', '74', '75', '76', '77', '78', '79',
  '80', '81', '82', '83', '84', '85', '86', '87', '88', '89',
  '90', '91', '92', '93', '94', '95', '96', '97', '98', '99',
  '100'];

const heightArray = ['cm', 'inches'];
const weightArray = ['kg', 'lbs'];
const genderArray = ['male', 'female', 'prefer not to say'];

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
  fieldContainer: {
    flexDirection: 'row',
    borderRadius: 10,
    borderColor: 'white',
    borderWidth: 2,
    padding: 15,
    marginTop: 5,
  },
  inputText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dropdownContainerStyle: {
    height: 30, paddingLeft: 20, paddingTop: 2,
  },
  dropdownStyle: {
    padding: 10, backgroundColor: '#001331',
  },
  dropdownTextHighlightStyle: {
    color: '#f5cb23',
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
    title: 'Extras',
  };

  state = {
    height: '',
    weight: '',
    age: '',
    gender: '',
    weightCategory: '',
    heightCategory: '',
    showError: false,
    showLoading: false,
    showButton: false,
  }

  componentDidMount() {
    const showButton = this.props.navigation.state.params === undefined ? true : false;
    this.setState({ showButton });
    // firebase.database().ref(`users/${this.props.screenProps.user.uid}`).on('value', (snap) => {
    //   const { height, weight } = snap.val();
    //   this.setState({ showButton, height, weight });
    // });
  }

  handleSubmit = () => {
    const {
      age,
      height,
      weight,
      gender,
      weightCategory,
      showButton,
      heightCategory,
    } = this.state;
    if (age === '' || height === '' || weight === '' || gender === '' || weightCategory === '' || heightCategory === '') {
      return this.setState({ showError: true, showLoading: false });
    }
    firebase.database().ref(`users/${this.props.screenProps.user.uid}`).update({
      age,
      weight,
      height,
      heightCategory,
      weightCategory,
      gender,
      extended: true,
    })
      .then(() => {
        this.setState({ showLoading: false });
        if (!showButton) {
          Alert.alert('Info Updated');
          this.props.navigation.navigate('Account');
        }
        // this.props.navigation.navigate('Tutorial', { showButton: true });
      });
  }

  renderPicker = (array) => {
    const pickerItem = array.map((item) => {
      return (
        <Picker.Item label={item} value={item} />
      );
    });
    return pickerItem;
  }

  render() {
    const {
      height, weight, showError, showLoading, showButton,
    } = this.state;
    return (
      <KeyboardAwareScrollView style={{ backgroundColor: '#001331' }} contentContainerStyle={styles.container} resetScrollToCoords={{ x: 0, y: 0 }}>
        <ScrollView>
          <Image style={styles.imageStyle} source={talonImage} />
          <View style={styles.fieldContainer}>
            <Text style={[styles.inputText, { marginTop: 2 }]}>
              Age
            </Text>
            <ModalDropdown
              options={ageArray}
              showsVerticalScrollIndicator
              style={[styles.dropdownContainerStyle, { marginLeft: 25 }]}
              defaultIndex={0}
              defaultValue="[selection field]"
              textStyle={styles.inputText}
              dropdownStyle={styles.dropdownStyle}
              dropdownTextStyle={[styles.inputText, { backgroundColor: '#001331' }]}
              dropdownTextHighlightStyle={{ color: '#f5cb23' }}
              onSelect={(index, value) => this.setState({ age: value })}
            />
          </View>
          <View style={styles.fieldContainer}>
            <TextInput
              style={[styles.inputText, { width: 60 }]}
              keyboardType="numeric"
              underlineColorAndroid="transparent"
              placeholder="Height"
              placeholderTextColor="white"
              onChangeText={value => this.setState({ height: value })}
              value={height}
            />
            <ModalDropdown
              options={heightArray}
              showsVerticalScrollIndicator
              style={styles.dropdownContainerStyle}
              defaultIndex={0}
              defaultValue="[cm/inches]"
              textStyle={styles.inputText}
              dropdownStyle={styles.dropdownStyle}
              dropdownTextStyle={[styles.inputText, { backgroundColor: '#001331' }]}
              dropdownTextHighlightStyle={{ color: '#f5cb23' }}
              onSelect={(index, value) => this.setState({ heightCategory: value })}
            />
          </View>
          <View style={styles.fieldContainer}>
            <TextInput
              style={[styles.inputText, { width: 60 }]}
              keyboardType="numeric"
              underlineColorAndroid="transparent"
              placeholder="Weight"
              placeholderTextColor="white"
              onChangeText={value => this.setState({ weight: value })}
              value={weight}
            />
            <ModalDropdown
              options={weightArray}
              showsVerticalScrollIndicator
              style={styles.dropdownContainerStyle}
              defaultIndex={0}
              defaultValue="[kg/lbs]"
              textStyle={styles.inputText}
              dropdownStyle={styles.dropdownStyle}
              dropdownTextStyle={[styles.inputText, { backgroundColor: '#001331' }]}
              dropdownTextHighlightStyle={{ color: '#f5cb23' }}
              onSelect={(index, value) => this.setState({ weightCategory: value })}
            />
          </View>
          <View style={styles.fieldContainer}>
            <Text style={[styles.inputText, { marginTop: 2 }]}>
              Gender
            </Text>
            <ModalDropdown
              options={genderArray}
              showsVerticalScrollIndicator
              style={styles.dropdownContainerStyle}
              defaultIndex={0}
              defaultValue="[male/female/prefer not to say]"
              textStyle={styles.inputText}
              dropdownStyle={styles.dropdownStyle}
              dropdownTextStyle={[styles.inputText, { backgroundColor: '#001331' }]}
              dropdownTextHighlightStyle={{ color: '#f5cb23' }}
              onSelect={(index, value) => this.setState({ gender: value })}
            />
          </View>
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
          {
            showButton
              ? (
                <Button
                  buttonStyle={{ backgroundColor: 'transparent', borderRadius: 5, marginTop: 10 }}
                  color="white"
                  title="Skip Personalisation info"
                  onPress={() => this.props.navigation.navigate('Tutorial')}
                />
              )
              : null
          }
        </ScrollView>
      </KeyboardAwareScrollView>
    );
  }
}
