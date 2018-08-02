import React from 'react';
import { View, Text } from 'react-native';
import { Button, ListItem } from 'react-native-elements';
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
};
export default class Main extends React.Component {
  logOut = () => {
    firebase.auth().signOut();
  }

  renderListItem = () => {
    const items = listItems.map((item, index) => {
      return (
        <ListItem
          title={item}
          titleStyle={{ color: 'white' }}
          containerStyle={{ backgroundColor: '#33425a' }}
          underlayColor="#2a3545"
          onPress={() => {
            if (index === 0) {
              this.logOut();
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
        {this.renderListItem()}
      </View>
    );
  }
}
