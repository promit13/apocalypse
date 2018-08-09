import React from 'react';
import {
  View, Text, Modal, TextInput, TouchableOpacity,
} from 'react-native';
import { ListItem, Button } from 'react-native-elements';
import firebase from '../config/firebase';

const listItems = ['Sign Out', 'Change Email or Password', 'Delete Account'];
const styles = {
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#001331',
  },
  text: {
    fontSize: 18,
    color: 'white',
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
};
export default class MyAccount extends React.Component {
  state = {
    password: '',
    modalVisible: false,
    errorVisible: false,
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
        firebase.auth().currentUser.delete()
          .then(() => firebase.database().ref(`users/${this.props.screenProps.user.uid}`).remove()
            .then(() => this.setState({ errorVisible: false })));
      }).catch(() => this.setState({ errorVisible: true }));
  }

  displayErrorText = () => {
    if (this.state.errorVisible) {
      return (
        <Text style={{ color: 'red', marginLeft: 10 }}>
          Invalid password
        </Text>
      );
    }
  }

  showModal = () => {
    return (
      <Modal transparent visible={this.state.modalVisible}>
        <View style={styles.modalView}>
          <TouchableOpacity onPress={() => this.setState({ modalVisible: false, password: '' })}>
            <View style={styles.modalInnerView}>
              <TextInput
                secureTextEntry
                style={styles.inputStyle}
                placeholder="Confirm your password"
                placeholderTextColor="#001331"
                onChangeText={password => this.setState({ password })}
                value={this.state.password}
              />
              {this.displayErrorText()}
              <Button color="#fff" buttonStyle={styles.button} title="Confirm" onPress={() => this.deleteAccount()} />
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
              return this.setState({ modalVisible: true });
            }
          }}
        />
      );
    });
    return items;
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={{ alignSelf: 'center', marginBottom: 10 }}>
          <Text style={styles.text}>
          Hi survivor
          </Text>
          <Text style={styles.text}>
            {this.props.screenProps.user.email}
          </Text>
        </View>
        {this.showModal()}
        <View style={{ padding: 10, backgroundColor: '#33425a' }}>
          {this.renderListItem()}
        </View>
      </View>
    );
  }
}
