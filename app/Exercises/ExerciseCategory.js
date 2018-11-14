import React from 'react';
import { Icon, Text } from 'react-native-elements';
import {
  View, Image, TouchableOpacity, StatusBar, Alert,
} from 'react-native';
import OfflineMsg from '../common/OfflineMsg';

const speedImage = require('../../img/speed.png');
const strengthImage = require('../../img/strength.png');
const controlImage = require('../../img/control.png');

const styles = {
  maincontainer: {
    flex: 1,
    backgroundColor: '#001331',
  },
  categoryView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 10,
    paddingRight: 10,
  },
  line: {
    width: '100%',
    height: 0.5,
    backgroundColor: 'white',
  },
  circularImageView: {
    height: 100,
    width: 100,
    borderRadius: 100 / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textStyle: {
    color: 'white',
    marginLeft: 20,
    marginRight: 10,
  },
};
export default class ExerciseCategory extends React.Component {
  static navigationOptions = {
    title: 'Exercises',
  };

  state = {
    isConnected: true,
  }

  componentDidMount() {
    this.setState({ isConnected: this.props.screenProps.netInfo });
  }

    renderView = (title, subtitle, imageSource) => {
      return (
        <TouchableOpacity onPress={() => {
          if (!this.state.isConnected) {
            return Alert.alert('No internet connection');
          }
          this.props.navigation.navigate('ExerciseList', { category: title });
        }
        }
        >
          <View style={styles.categoryView}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={styles.circularImageView}>
                <Image
                  style={{
                    height: 100,
                    width: 100,
                    borderRadius: 100 / 2,
                    borderColor: 'white',
                  }}
                  source={imageSource}
                  resizeMethod="resize"
                />
              </View>
              <View>
                <Text style={[styles.textStyle, { fontSize: 20, fontWeight: 'bold' }]}>
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
        <View style={styles.maincontainer}>
          { !this.state.isConnected ? <OfflineMsg /> : null }
          <View style={{ flex: 1, justifyContent: 'center' }}>
            {this.renderView('Speed', 'Running Training', speedImage)}
          </View>
          <View style={styles.line} />
          <View style={{ flex: 1, justifyContent: 'center' }}>
            {this.renderView('Strength', 'Bodyweight Circuits', strengthImage)}
          </View>
          <View style={styles.line} />
          <View style={{ flex: 1, justifyContent: 'center' }}>
            {this.renderView('Control', 'Stretch and Core', controlImage)}
          </View>
        </View>
      );
    }
}
