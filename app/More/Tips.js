import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-elements';
import HTML from 'react-native-render-html'
import firebase from '../config/firebase';

const styles = {
  mainViewContainer: {
    backgroundColor: '#001331',
    flex: 1,
    marginTop: 1,
    padding: 16,
  },
};

export default class Tips extends React.Component {
  static navigationOptions = {
    title: 'Tips and FAQ',
  };

  state = {
    content: 'content',
  }

  componentDidMount() {
    firebase.database().ref('screens')
      .orderByChild('title')
      .equalTo('FAQ')
      .once('value', (snapshot) => {
        snapshot.forEach((childSnapshot) => {
          console.log(childSnapshot.val().description);
          this.setState({ content: `<div style="color:white;">${childSnapshot.val().description}</div>` })
        });
      });
  }

  render() {
    return (
      <View style={styles.mainViewContainer}>
        <HTML html={this.state.content} />
      </View>
    );
  }
}
