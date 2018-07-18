import React from 'react';
import { ScrollView, View, Image, Dimensions } from 'react-native';
import { Text, ListItem, Icon } from 'react-native-elements';
import firebase from './config/firebase';

const windowSize = Dimensions.get('window');

const styles = {
  titleContainerStyle: {
    flex: 1,
    flexDirection: 'row',
    width: windowSize.width,
    backgroundColor: '#000080',
    padding: 10,
  },
  subtitleViewStyle: {
    width: windowSize.width,
    backgroundColor: '#34495E',
    padding: 10,
  },
  imageStyle: {
    width: windowSize.width,
    height: 200,
  },
  textStyle: {
    color: 'white',
  },
};
export default class Talon extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      series: '',
    };
  }

  componentDidMount() {
    firebase.database().ref('series').on('value', snapshot => this.setState({ series: snapshot.val() }));
    console.log(this.state.series);
  }


  renderSubtitle = ({ episodes }) => {
    const episode = Object.entries(episodes).map(([key, value], i) => {
      return (
        <View>
          <Text style={styles.textStyle}>
            {value.category}
          </Text>
          <View style={{ flex: 1, flexDirection: 'row' }}>
            <View style={{
              width: 50,
              height: 30,
              backgroundColor: 'red',
              borderColor: 'white',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 10,
            }}
            >
              <Text style={styles.textStyle}>
             1
              </Text>
            </View>
            <View style={{
              width: 50,
              height: 30,
              backgroundColor: 'purple',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 10,
            }}
            >
              <Text style={styles.textStyle}>
             2
              </Text>
            </View>
            <View style={{
              width: 50,
              height: 30,
              backgroundColor: 'green',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 10,
            }}
            >
              <Text style={styles.textStyle}>
             3
              </Text>
            </View>
          </View>
        </View>
      );
    });
    return (
      <View>
        {episode}
      </View>);
  }

  render() {
    const series = Object.entries(this.state.series).map(([key, value], i) => {
      return (
        <ListItem
          key={i}
          hideChevron
          title={
            <View style={styles.titleContainerStyle}>
              <Text h4 style={styles.textStyle}>
                {value.title}
              </Text>
              <Icon name="info" color="yellow" />
            </View>
          }
          subtitle={
            <View style={styles.subtitleViewStyle}>
              <View>
                {this.renderSubtitle({ episodes: value.episodes })}
              </View>
            </View>
        }
        />
      );
    });
    return (
      <ScrollView>
        <Image
          style={styles.imageStyle}
          source={{ uri: 'https://facebook.github.io/react/logo-og.png' }}
        />
        {series}
      </ScrollView>
    );
  }
}
