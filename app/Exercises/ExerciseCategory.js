import React from 'react';
import { Icon, Text } from 'react-native-elements';
import {
  View, ScrollView, Image, TouchableOpacity,
} from 'react-native';

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
    paddingTop: 40,
    paddingBottom: 40,
  },
  circularImageView: {
    height: 120,
    width: 120,
    borderWidth: 1,
    borderColor: 'white',
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
    title: 'Exercise Category',
  };

    renderView = (title, subtitle, imageUrl) => {
      return (
        <TouchableOpacity onPress={() => this.props.navigation.navigate('ExerciseList', { category: title })}>
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
                  source={{ uri: imageUrl }}
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
        <View style={styles.maincontainer}>
          <ScrollView>
            {this.renderView('Speed', 'Running Training', 'https://firebasestorage.googleapis.com/v0/b/astraining-95c0a.appspot.com/o/Running%20Logo%20White%20BG.png?alt=media&token=6df03197-e7cb-4bc2-aac5-b51e6404ff90')}
            {this.renderView('Strength', 'Bodyweight Circuits', 'https://firebasestorage.googleapis.com/v0/b/astraining-95c0a.appspot.com/o/Circuit%20Logo%20White%20BG.png?alt=media&token=ac1d355d-3a86-417a-9327-8ad00032a077')}
            {this.renderView('Control', 'Stretch and Core', 'https://firebasestorage.googleapis.com/v0/b/astraining-95c0a.appspot.com/o/Holistic%20Logo%20White%20BG.png?alt=media&token=ad9ce094-4e19-4d7c-b96b-c3550dbfc291')}
          </ScrollView>
        </View>
      );
    }
}
