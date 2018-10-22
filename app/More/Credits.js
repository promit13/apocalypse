import React, { Component } from 'react';
import { View, ScrollView } from 'react-native';
import HTML from 'react-native-render-html';
import firebase from '../config/firebase';
import Loading from '../common/Loading';

const styles ={
  mainViewContainer: {
    backgroundColor: '#001331',
    flex: 1,
    marginTop: 1,
    padding: 16,
  },
};

export default class Credits extends Component {
  static navigationOptions = {
    title: 'Credits',
  };

  state = {
    content: '',
    loading: true,
  }

  componentDidMount() {
    firebase.database().ref('screens')
      .orderByChild('title')
      .equalTo('Credits')
      .once('value', (snapshot) => {
        snapshot.forEach((childSnapshot) => {
          this.setState({ content: `<div style="color:white;">${childSnapshot.val().description}</div>`, loading: false });
        });
      });
  }

  render() {
    const { loading, content } = this.state;
    return (
      <View style={styles.mainViewContainer}>
        {
          loading
            ? <Loading />
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
