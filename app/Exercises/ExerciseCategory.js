import React from 'react';
import { Icon, Text } from 'react-native-elements';
import {
  View, Image, TouchableOpacity,
} from 'react-native';
import { scale, moderateScale } from 'react-native-size-matters';
import OfflineMsg from '../common/OfflineMsg';
import ShowModal from '../common/ShowModal';

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
    paddingLeft: moderateScale(10),
    paddingRight: moderateScale(10),
  },
  line: {
    width: '100%',
    height: 0.5,
    backgroundColor: 'white',
  },
  circularImageView: {
    height: scale(100),
    width: scale(100),
    borderRadius: scale(100 / 2),
    alignItems: 'center',
    justifyContent: 'center',
  },
  textStyle: {
    color: 'white',
    fontSize: moderateScale(10),
    marginLeft: moderateScale(20),
    marginRight: moderateScale(10),
  },
};
export default class ExerciseCategory extends React.Component {
  static navigationOptions = {
    title: 'Exercises',
  };

  state = {
    showNoInternetDialog: false,
  }

    renderView = (title, subtitle, imageSource) => {
      const { netInfo } = this.props.screenProps;
      return (
        <TouchableOpacity onPress={() => {
          if (!netInfo) {
            return this.setState({ showNoInternetDialog: true });
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
                    height: scale(100),
                    width: scale(100),
                    borderRadius: scale(100 / 2),
                    borderColor: 'white',
                  }}
                  source={imageSource}
                  resizeMethod="resize"
                />
              </View>
              <View>
                <Text style={[styles.textStyle, { fontSize: moderateScale(20), fontWeight: 'bold' }]}>
                  {title}
                </Text>
                <Text style={styles.textStyle}>
                  {subtitle}
                </Text>
              </View>
            </View>
            <Icon style={{ alignSelf: 'flex-end' }} name="chevron-thin-right" type="entypo" color="white" size={moderateScale(30)} />
          </View>
        </TouchableOpacity>
      );
    }

    render() {
      const { showNoInternetDialog } = this.state;
      const { netInfo } = this.props.screenProps;
      return (
        <View style={styles.maincontainer}>
          { !netInfo ? <OfflineMsg /> : null }
          <View style={{ flex: 1, justifyContent: 'center' }}>
            {this.renderView('Speed', 'Running Training', speedImage)}
          </View>
          <View style={styles.line} />
          <ShowModal
            visible={showNoInternetDialog}
            title="Please check your internet connection"
            buttonText="OK"
            onPress={() => {
              this.setState({ showNoInternetDialog: false });
            }}
          />
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
