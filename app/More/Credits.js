import React, { Component } from 'react';
import { View, ScrollView, AsyncStorage } from 'react-native';
import HTML from 'react-native-render-html';
import firebase from '../config/firebase';
import LoadScreen from '../common/LoadScreen';

const styles ={
  mainViewContainer: {
    backgroundColor: '#001331',
    flex: 1,
    marginTop: 1,
    padding: 10,
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

  componentDidMount = async () => {
    if (!this.props.screenProps.netInfo) {
      const offlineData = await AsyncStorage.getItem('credits');
      const jsonObjectData = JSON.parse(offlineData);
      const { credits } = jsonObjectData;
      console.log(credits);
      this.setState({ content: `<div style="color:white;">${credits[0].description}</div>`, loading: false });
      return;
    }
    firebase.database().ref('screens')
      .orderByChild('title')
      .equalTo('Credits')
      .once('value', (snapshot) => {
        console.log(snapshot.val());
        const snapVal = Object.values(snapshot.val());
        // snapshot.forEach((childSnapshot) => {
        //   this.setState({ showCheckbox, content: `<div style="color:white;">${childSnapshot.val().description}</div>`, showLoading: false });
        // });
        this.setState({ content: `<div style="color:white;">${snapVal[0].description}</div>`, loading: false });
        AsyncStorage.setItem('credits', JSON.stringify({
          credits: snapVal,
        }));
      });
    // firebase.database().ref('screens')
    //   .orderByChild('title')
    //   .equalTo('Credits')
    //   .once('value', (snapshot) => {
    //     snapshot.forEach((childSnapshot) => {
    //       this.setState({ content: `<div style="color:white;">${childSnapshot.val().description}</div>`, loading: false });
    //     });
    //   });
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
