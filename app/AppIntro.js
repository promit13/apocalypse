import React from 'react';
import { Image, View } from 'react-native';
import { Text, Button } from 'react-native-elements';
import Swiper from 'react-native-swiper';

const styles = {
  containerStyle: {
    flex: 1,
    backgroundColor: "#001331",
    justifyContent: 'center',
    alignItems: 'center',
  },
  textStyle: {
    marginTop: 10,
  },
  imageStyle: {
    width: 200,
    height: 200,
  },
  slideStyle: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#9DD6EB',
    padding: 20,
  },
};

export default class Tutorial extends React.Component {

  renderSlides = () => {
    return (
      <View style={styles.containerStyle}>
        <Image style={styles.imageStyle} source={{ uri: 'https://facebook.github.io/react/logo-og.png' }}/>
      </View>

    )
  }

  render() {
    return (
      <Swiper
        loop={false}
        showsButtons
      >
        <View style={}>
          
        </View>
      </Swiper>
    );
  }
}
