import React from 'react';
import { View, Modal, Image } from 'react-native';
import { Button, Text } from 'react-native-elements';
import { moderateScale } from 'react-native-size-matters';

const star = require('../../img/star.png');

const styles = {
  modal: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: moderateScale(10),
  },
  image: {
    alignSelf: 'center',
    width: moderateScale(150),
    height: moderateScale(150),
  },
  modalInnerView: {
    backgroundColor: '#f2f2f2',
    padding: moderateScale(10),
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#001331',
    borderRadius: moderateScale(5),
    marginTop: moderateScale(10),
  },
  text: {
    color: '#001331',
    marginTop: moderateScale(10),
    textAlign: 'center',
  },
};

export default ShowModal = ({
  visible,
  title,
  description,
  buttonText,
  textSize,
  secondButtonText,
  askAdvance,
  onSecondButtonPress,
  onPress,
  showImage,
}) => (
  <Modal transparent visible={visible}>
    <View style={styles.modal}>
      <View style={styles.modalInnerView}>
        {
          showImage && (
            <Image
              resizeMode="contain"
              resizeMethod="scale"
              style={styles.image}
              source={star}
            />
          )
        }
        <View style={{ justifyContent: 'center' }}>
          <Text style={[styles.text, { fontWeight: 'bold', fontSize: moderateScale(18) }]}>
            {title}
          </Text>
          <Text style={[styles.text, { fontSize: moderateScale(14) }]}>
            {description}
          </Text>
        </View>
        { askAdvance && (
          <Button
            buttonStyle={[styles.button, { backgroundColor: 'white' }]}
            title={secondButtonText}
            color="#001331"
            fontSize={moderateScale(14)}
            onPress={() => onSecondButtonPress()}
          />
        )
        }
        <Button
          buttonStyle={styles.button}
          title={buttonText}
          color="white"
          fontSize={moderateScale(16)}
          onPress={() => onPress()}
        />
      </View>
    </View>
  </Modal>
);
