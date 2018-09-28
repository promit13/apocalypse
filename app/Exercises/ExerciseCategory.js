import React from 'react';
import { Icon, Text } from 'react-native-elements';
import {
  View, ScrollView, Image, TouchableOpacity, StatusBar, Alert,
} from 'react-native';
import OfflineMsg from '../common/OfflineMsg';

const speedImage = require('../../img/speed.png');
const strengthImage = require('../../img/strength.png');
const controlImage = require('../../img/control.png');

const styles = {
  maincontainer: {
    flex: 3,
    backgroundColor: '#001331',
  },
  categoryView: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#001331',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderColor: '#33425a',
    borderWidth: 1,
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 30,
    paddingBottom: 30,
  },
  circularImageView: {
    height: 120,
    width: 120,
    borderRadius: 120 / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textStyle: {
    color: 'white',
    marginLeft: 10,
    marginRight: 10,
  },
};
export default class ExerciseCategory extends React.Component {
  static navigationOptions = {
    title: 'Exercises',
  };

  componentWillMount() {
    this.setState({ isConnected: this.props.screenProps.netInfo });
  }

    renderView = (title, subtitle, imageSource) => {
      return (
        <TouchableOpacity onPress={() => {
          if (!this.state.isConnected) {
            return Alert.alert('No internet connection');
          }
          this.props.navigation.navigate('ExerciseList', { category: title })} 
        }
        >
          <View style={styles.categoryView}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={styles.circularImageView}>
                <Image
                  style={{
                    height: 120,
                    width: 120,
                    borderRadius: 120 / 2,
                    borderColor: 'white',
                  }}
                  source={imageSource}
                />
              </View>
              <View>
                <Text h3 style={styles.textStyle}>
                  {title}
                </Text>
                <Text style={styles.textStyle}>
                  {subtitle}
                </Text>
              </View>
            </View>
            <Icon style={{ alignSelf: 'flex-end' }} name="chevron-thin-right" type="entypo" color="white" />
          </View>
        </TouchableOpacity>
      );
    }

    render() {
      return (
        <ScrollView style={styles.maincontainer}>
          <StatusBar backgroundColor="#00000b" />
          {this.renderView('Speed', 'Running Training', speedImage)}
          {this.renderView('Strength', 'Bodyweight Circuits', strengthImage)}
          {this.renderView('Control', 'Stretch and Core', controlImage)}
        </ScrollView>
      );
    }
}
