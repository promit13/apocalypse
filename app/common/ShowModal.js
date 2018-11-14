import React from 'react';
import { View, Modal } from 'react-native';
import { Button, Text } from 'react-native-elements';

const styles = {
  modal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  modalInnerView: {
    backgroundColor: '#f2f2f2',
    padding: 10,
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#001331',
    borderRadius: 5,
    marginTop: 10,
  },
  text: {
    color: '#001331',
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  },
};

export default ShowModal = ({
  visible,
  title,
  description,
  buttonText,
  secondButtonText,
  askAdvance,
  onSecondButtonPress,
  onPress,
}) => (
  <Modal transparent visible={visible}>
    <View style={styles.modal}>
      <View style={styles.modalInnerView}>
        <View style={{ justifyContent: 'center' }}>
          <Text style={[styles.text, { fontWeight: 'bold' }]}>
            {title}
          </Text>
          <Text style={styles.text}>
            {description}
          </Text>
        </View>
        { askAdvance && (
          <Button
            buttonStyle={[styles.button, { backgroundColor: 'white' }]}
            title={buttonText}
            color="gray"
            onPress={() => onPress()}
          />
        )
        }
        <Button
          buttonStyle={styles.button}
          title={secondButtonText}
          color="#fff"
          onPress={() => onSecondButtonPress()}
        />
      </View>
    </View>
  </Modal>
);