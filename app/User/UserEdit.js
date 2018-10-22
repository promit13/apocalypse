import React from 'react';
import {
  View, Text, Modal, TextInput, TouchableOpacity, Image, ScrollView, Dimensions,
} from 'react-native';
import { ListItem, Button } from 'react-native-elements';
import firebase from '../config/firebase';
import Loading from '../common/Loading';
import ErrorMessage from '../common/Error';

const { width } = Dimensions.get('window');
const imageSize = width - 80;

const talonImage = require('../../img/talon.png');

const listItems = ['Sign Out', 'Change Password', 'Delete Account'];
const styles = {
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#001331',
  },
  text: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
  },
  button: {
    margin: 10,
    backgroundColor: '#001331',
  },
  modalView: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    padding: 10,
  },
  modalInnerView: {
    backgroundColor: '#fff',
    padding: 10,
  },
  inputStyle: {
    borderColor: '#001331',
    borderRadius: 5,
    borderWidth: 2,
    padding: 10,
    height: 40,
    color: '#001331',
    margin: 10,
  },
  imageStyle: {
    height: imageSize,
    width: imageSize,
    alignSelf: 'center',
    marginTop: 20,
  },
};
export default class MyAccount extends React.Component {
  static navigationOptions = {
    title: 'My Account',
  };

  state = {
    password: '',
    showModal: false,
    showError: false,
    showLoading: false,
  };

  logOut = () => {
    firebase.auth().signOut();
  }

  deleteAccount = async () => {
    const user = firebase.auth().currentUser;
    const credentials = await firebase.auth.EmailAuthProvider.credential(
      user.email,
      this.state.password,
    );
    firebase.auth().currentUser.reauthenticateAndRetrieveDataWithCredential(credentials)
      .then(() => {
        firebase.database().ref(`users/${this.props.screenProps.user.uid}`).remove()
          .then(() => firebase.auth().currentUser.delete()
            .then(() => {
              this.setState({ showError: false, showLoading: false });
            }));
      }).catch(() => this.setState({ showError: true, showLoading: false }));
  }

  showModal = () => {
    return (
      <Modal transparent visible={this.state.showModal}>
        <View style={styles.modalView}>
          <TouchableOpacity onPress={() => this.setState({ showModal: false, password: '' })}>
            <View style={styles.modalInnerView}>
              <TextInput
                underlineColorAndroid="transparent"
                secureTextEntry
                style={styles.inputStyle}
                placeholder="Confirm your password"
                placeholderTextColor="#001331"
                onChangeText={password => this.setState({ password })}
                value={this.state.password}
              />
              {this.state.showError ? <ErrorMessage errorMessage="Incorrect password" /> : null}
              {this.state.showLoading ? <Loading /> : null}
              <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                <Button
                  color="#fff"
                  buttonStyle={styles.button}
                  title="Cancel"
                  onPress={() => {
                    this.setState({ showModal: false });
                  }}
                />
                <Button
                  color="#fff"
                  buttonStyle={styles.button}
                  title="Confirm"
                  onPress={() => {
                    this.setState({ showLoading: true });
                    this.deleteAccount();
                  }}
                />
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  renderListItem = () => {
    const items = listItems.map((item, index) => {
      return (
        <ListItem
          key={item}
          title={item}
          titleStyle={{ color: 'white' }}
          underlayColor="#2a3545"
          onPress={() => {
            if (index === 0) {
              return this.logOut();
            }
            if (index === 1) {
              return this.props.navigation.navigate('ChangeEmailPassword');
            }
            if (index === 2) {
              return this.setState({ showModal: true });
            }
          }}
        />
      );
    });
    return items;
  }

  render() {
    const { user, userData } = this.props.screenProps;
    return (
      <View style={styles.container}>
        <ScrollView>
          <Image style={styles.imageStyle} source={talonImage} />
          <View style={{ alignSelf: 'center', marginBottom: 10 }}>
            <Text style={[styles.text, { marginTop: 10 }]}>
              {`Welcome, Agent ${userData.fullNameLowercase}`}
            </Text>
            <Text style={styles.text}>
              {user.email}
            </Text>
          </View>
          {this.showModal()}
          <View style={{ padding: 10, backgroundColor: '#33425a' }}>
            {this.renderListItem()}
          </View>
        </ScrollView>
      </View>
    );
  }
}
