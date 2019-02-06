import React from 'react';
import { View, ScrollView } from 'react-native';
import { ListItem } from 'react-native-elements';
import { moderateScale } from 'react-native-size-matters';
import firebase from '../config/firebase';
import Loading from '../common/Loading';

const styles = {
  mainViewContainer: {
    flex: 1,
    backgroundColor: '#001331',
    marginTop: moderateScale(1),
  },
};

export default class Trailers extends React.Component {
  static navigationOptions = {
    title: 'Trailers',
  };

  state = {
    trailers: '',
    loading: true,
  }

  componentDidMount() {
    firebase.database().ref('trailers').on('value', (snapshot) => {
      const trailers = Object.values(snapshot.val());
      const sortedTrailerArray = trailers.sort((a, b) => parseInt(a.position, 10) - parseInt(b.position, 10));
      this.setState({ trailers: sortedTrailerArray, loading: false });
    });
  }

  render() {
    const trailerList = Object.entries(this.state.trailers).map(([key, value], i) => {
      return (
        <ListItem
          key={key}
          title={value.title}
          titleStyle={{ color: 'white', fontSize: moderateScale(18) }}
          containerStyle={{ backgroundColor: '#33425a' }}
          undderlayColor="#2a3545"
          onPress={() => {
            const { video, title, image } = value;
            this.props.navigation.navigate('TalonIntelPlayer', {
              video,
              exerciseTitle: title,
              image,
              mode: 'Trailer Player',
              navigateBack: 'Trailers',
            });
          }}
        />
      );
    });
    return (
      <View style={styles.mainViewContainer}>
        {
          this.state.loading
            ? <Loading />
            : (
              <ScrollView>
                {trailerList}
              </ScrollView>
            )
        }
      </View>
    );
  }
}
