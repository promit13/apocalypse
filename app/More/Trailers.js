import React from 'react';
import { View, ScrollView } from 'react-native';
import { ListItem } from 'react-native-elements';
import firebase from '../config/firebase';

const styles = {
  mainViewContainer: {
    flex: 1,
    backgroundColor: '#001331',
    marginTop: 1,
  },
};

export default class Trailers extends React.Component {
  static navigationOptions = {
    title: 'Trailers',
  };

  state = {
    trailers: '',
  }

  componentDidMount() {
    firebase.database().ref('trailers').on('value', (snapshot) => {
      const trailers = Object.values(snapshot.val());
     const sortedTrailerArray = trailers.sort((a, b) => parseInt(a.position, 10) - parseInt(b.position, 10));
    this.setState({ trailers: sortedTrailerArray});
    });
  }

  render() {
    const trailerList = Object.entries(this.state.trailers).map(([key, value], i) => {
      return (
        <ListItem 
          key={key}
          title={value.title}
          titleStyle={{ color: 'white', fontSize: 18 }}
          containerStyle={{ backgroundColor: '#33425a' }}
          undderlayColor="#2a3545"
          onPress={() => {
            this.props.navigation.navigate('TrailerPlayer', {
              URL: value.video,
              title: value.title,
            });
          }}
        />
      );
    });
    return (
      <View style={styles.mainViewContainer}>
        <ScrollView>
          {trailerList}
        </ScrollView>
      </View>
    );
  }
}
