import React from 'react';
import { Icon, Text } from 'react-native-elements';
import {
  View,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import * as Animatable from 'react-native-animatable';

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
    renderView = (imageUrl, title, subtitle) => {
      return (
        <TouchableOpacity onPress={() => this.props.navigation.navigate('ExerciseList', { category: title })}>
          <Animatable.View animation="bounceIn" style={styles.categoryView}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={styles.circularImageView}>
                <Image
                  style={{
                    height: 120,
                    width: 120,
                    borderRadius: 120 / 2,
                    borderColor: 'white',
                  }}
                  source={{ uri: 'https://content.active.com/Assets/Active.com+Content+Site+Digital+Assets/Running/580/zombies-run.jpg' }}
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
          </Animatable.View>
        </TouchableOpacity>
      );
    }

    render() {
      return (
        <View style={styles.maincontainer}>
          <ScrollView>
            {this.renderView('imageUrl', 'Speed', 'Running Training')}
            {this.renderView('imageUrl', 'Strength', 'Bodyweight Circuits')}
            {this.renderView('imageUrl', 'Control', 'Stretch and Core')}
          </ScrollView>
        </View>
      );
    }
}
