import React from 'react';
import {
  ScrollView,
  View,
  Image,
} from 'react-native';
import { Text, ListItem, Icon } from 'react-native-elements';
import firebase from '../config/firebase';
import Loading from '../common/Loading';

const styles = {
  imageStyle: {
    width: '100%',
    height: 200,
  },
  textStyle: {
    color: 'white',
  },
  latestIntelView: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
  },
  circularImageView: {
    height: 60,
    width: 60,
    borderWidth: 5,
    borderColor: 'white',
    borderRadius: 60 / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
};

export default class Talon extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      series: '',
      index: 0,
      loading: true,
    };
  }

  componentDidMount() {
    firebase.database().ref('series').on('value', snapshot => this.setState({ series: snapshot.val(), loading: false }))
  }

  renderContent = (i) => {
    if (this.state.index === i) {
      return (
        <View style={{ backgroundColor: '#445878' }}>
          <ListItem
            title={`Episode ${i} Intel`}
            titleStyle={{ color: 'white' }}
            underlayColor="#2a3545"
            onPress={() => {}}
          />
          <View style={{ padding: 15 }}>
            <Text style={styles.textStyle}>
              01/02/18 - Ep01 -4.00 km/2.48 m in 31:46
            </Text>
            <View style={{
              marginTop: 10,
              marginBottom: 10,
              height: 1,
              width: '100%',
              backgroundColor: 'white',
            }}
            />
            <Text style={styles.textStyle}>
              07/02/18 - Ep01 -4.60 km/2.58 m in 31:46
            </Text>
          </View>
        </View>
      );
    }
  }

  render() {
    const series = Object.entries(this.state.series).map(([key, value], i) => {
      return (
        <View>
          <ListItem
            key={key}
            roundAvatar
            avatar={{ uri: 'https://facebook.github.io/react/logo-og.png' }}
            title={`Episode ${i + 1} Intel File`}
            titleStyle={{ color: 'white', fontSize: 16 }}
            rightIcon={{ name: 'chevron-down', type: 'feather', color: '#f5cb23' }}
            containerStyle={{ backgroundColor: '#33425a' }}
            underlayColor="#2a3545"
            onPress={() => {
              this.setState({ index: i + 1 });
            }}
          />
          {this.renderContent(i + 1)}
        </View>
      );
    });
    if (this.state.loading) return <Loading />;
    return (
      <View style={{ flex: 1, backgroundColor: '#001331' }}>
        <ScrollView>
          <Image
            style={styles.imageStyle}
            source={{ uri: 'https://facebook.github.io/react/logo-og.png' }}
          />
          <View style={styles.latestIntelView}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={styles.circularImageView}>
                <Image
                  style={{
                    height: 60,
                    width: 60,
                    borderRadius: 60 / 2,
                  }}
                  source={{ uri: 'https://facebook.github.io/react/logo-og.png' }}
                />
              </View>
              <View>
                <Text style={{
                  fontSize: 18,
                  color: '#001331',
                  marginLeft: 10,
                  marginRight: 10,
                }}
                >
                  Play Latest Essential Intel
                </Text>
                <Text style={{ color: '#001331', marginLeft: 10, marginRight: 10 }}>
                  6. The War Within
                </Text>
              </View>
            </View>
            <Icon style={{ alignSelf: 'flex-end' }} name="chevron-thin-right" type="entypo" color="#f5cb23" />
          </View>
          {series}
        </ScrollView>
      </View>
    );
  }
}
