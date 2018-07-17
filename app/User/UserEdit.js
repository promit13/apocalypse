import React from 'react';
import { View, AsyncStorage } from 'react-native';
import { Button, Text } from 'react-native-elements';

import firebase from '../config/firebase';

export default class Main extends React.Component {
  logOut = () => {
    firebase.auth().signOut();
  }

  render() {
    return (
      <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
        <Text h3>
          Hi survivor
        </Text>
        <Text>
          {this.props.screenProps.user.email}
        </Text>
        <Text>
          {this.props.screenProps.user.uid}
        </Text>
        <Button
          buttonStyle={{ marginTop: 20 }}
          backgroundColor="transparent"
          textStyle={{ color: '#bcbec1' }}
          title="Logout"
          onPress={this.logOut}
        />
      </View>
    );
  }
}
