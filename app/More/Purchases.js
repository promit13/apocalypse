import React from 'react';
import { View, Platform, Alert } from 'react-native';
import { Text, Button } from 'react-native-elements';
import * as RNIap from 'react-native-iap';
import firebase from '../config/firebase';

const styles = {
  containerView: {
    flex: 1,
    justifyContent: 'center',
  },
  button: {
    marginTop: 10,
  },
};
const productItems = Platform.select({
  ios: [
    'test.ep.1',
    'test.ep.2',
  ],
  android: [
    'test.ep.1',
    'test.ep.2',
  ],
});
export default class Purchases extends React.Component {
  static navigationOptions = {
    title: 'Purchases',
  };

  state = {
    productList: [],
    receipt: '',
    availableItemsMessage: '',
    error: '',
  };

  // componentDidMount = async () => {
  //   try {
  //     await RNIap.prepare();
  //     const products = await RNIap.getProducts(productItems);
  //     this.setState({ productList: products });
  //     console.log('PRODUCTS', products);
  //   } catch (err) {
  //     this.setState({ error: err });
  //     console.log(err);
  //   }
  // }

  // componentWillUnmount() {
  //   RNIap.endConnection();
  // }

  getItems = async () => {
    try {
      const products = await RNIap.getProducts(productItems);
      this.setState({ productList: products });
      console.log('Products', this.state.productList);
    } catch (err) {
      this.setState({ error: err });
      console.warn(err.code, err.message);
    }
  }

  getAvailablePurchases = async () => {
    try {
      const purchases = await RNIap.getAvailablePurchases();
      console.log('Available purchases :: ', purchases);
      if (purchases && purchases.length > 0) {
        this.setState({
          availableItemsMessage: `Got ${purchases.length} items.`,
          receipt: purchases[0].transactionReceipt,
        });
        console.log('Get available purchases', this.state.availableItemsMessage);
        console.log('Receipt', this.state.receipt);
      }
    } catch (err) {
      this.setState({ error: err });
      console.warn(err.code, err.message);
      Alert.alert(err.message);
    }
  }

  buySubscribeItem = async (item) => {
    try {
      console.log('buySubscribeItem: ', item);
      const purchase = await RNIap.buySubscription(item);
      console.log(purchase);
      this.setState({ receipt: purchase.transactionReceipt }, () => this.goToNext());
    } catch (err) {
      this.setState({ error: err });
      console.warn(err.code, err.message);
      Alert.alert(err.message);
    }
  }

  updateUserData = (item) => {
    firebase.database().ref(`users/${this.props.screenProps.user.uid}/purchases`).push({
      storeId: item,
      seriesId: '-LL_L_vlY6JVcE91Fj_V',
      price: 2,
      date: 1,
    })
      .then(() => {
        Alert.alert('Item purchased');
      });
  };

  buyItem = async (item) => {
    try {
      console.log('buyItem: ', item);
      // const purchase = await RNIap.buyProduct(sku);
      const purchase = await RNIap.buyProductWithoutFinishTransaction(item);
      console.log(purchase);
      this.setState({ receipt: purchase.transactionReceipt });
      firebase.database().ref(`users/${this.props.screenProps.user.uid}/purchases`).set({
        storeId: item,
        seriesId: item,
        value: 1,
        date: 1,
      })
        .then(() => {
          Alert.alert('Item purchased');
        });
    } catch (err) {
      this.setState({ error: err });
      console.warn(err.code, err.message);
      Alert.alert(err.message);
    }
  }


  render() {
    return (
      <View>
        <Text>
          {this.state.receipt}
        </Text>
        <Text>
          {this.state.availableItemsMessage}
        </Text>
        <Text>
          {this.state.error}
        </Text>
        <Button
          title="Get Products"
          onPress={() => this.updateUserData('test.ep.1')}
          buttonStyle={styles.button}
        />
        <Button
          title="Get Available Purchases"
          onPress={() => this.getAvailablePurchases()}
          buttonStyle={styles.button}
        />
      </View>
    );
  }
}
