import React from 'react';
import { View, ScrollView } from 'react-native';
import HTML from 'react-native-render-html';
import firebase from '../config/firebase';
import LoadScreen from '../common/LoadScreen';

const styles = {
  mainViewContainer: {
    backgroundColor: '#001331',
    flex: 1,
    marginTop: 1,
    padding: 10,
  },
};

export default class Kickstarter extends React.Component {
  static navigationOptions = {
    title: 'Kickstarters',
  };

  state = {
    content: '',
    loading: true,
  };

  componentDidMount() {
    firebase.database().ref('screens')
      .orderByChild('title')
      .equalTo('Kickstarter Backers')
      .once('value', (snapshot) => {
        snapshot.forEach((childSnapshot) => {
          this.setState({ content: `<div style="color:white;">${childSnapshot.val().description}</div>`, loading: false });
        });
      });
  }

  render() {
    const { loading, content } = this.state;
    return (
      <View style={[styles.mainViewContainer, { justifyContent: loading ? 'center' : null, alignItems: loading ? 'center' : null }]}>
        {
          loading
            ? <LoadScreen />
            : (
              <ScrollView>
                <HTML html={content} />
              </ScrollView>
            )
        }
      </View>
    );
  }
}
