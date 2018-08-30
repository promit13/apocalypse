import React from 'react';
import { View, Platform, Alert } from 'react-native';
import { Text, Button } from 'react-native-elements';
import * as RNIap from 'react-native-iap';

const styles = {
  containerView: {
    flex: 1,
    justifyContent: 'center',
  },
  button: {
    marginTop: 10,
  },
};
const itemSkus = Platform.select({
  ios: [
    'com.example.coins100',
  ],
  android: [
    'astapp.iap.s1',
    'astapp.iap.s1p1',
    'astapp.iap.s1p2',
    'astapp.iap.s1p3',
    'astapp.iap.s1p4',
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
  };

  componentDidMount = async () => {
    try {
      await RNIap.prepare();
      const products = await RNIap.getProducts(itemSkus);
      console.log('PRODUCTS', products);
    } catch (err) {
      console.log(err);
    }
  }

  componentWillUnmount() {
    RNIap.endConnection();
  }

  getItems = async () => {
    try {
      const products = await RNIap.getProducts(itemSkus);
      this.setState({ productList: products });
      console.log('Products', this.state.productList);
    } catch (err) {
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
      console.warn(err.code, err.message);
      Alert.alert(err.message);
    }
  }

  buySubscribeItem = async (sku) => {
    try {
      console.log('buySubscribeItem: ', sku);
      const purchase = await RNIap.buySubscription(sku);
      console.log(purchase);
      this.setState({ receipt: purchase.transactionReceipt }, () => this.goToNext());
    } catch (err) {
      console.warn(err.code, err.message);
      Alert.alert(err.message);
    }
  }

  buyItem = async (sku) => {
    try {
      console.log('buyItem: ', sku);
      // const purchase = await RNIap.buyProduct(sku);
      const purchase = await RNIap.buyProductWithoutFinishTransaction(sku);
      console.log(purchase);
      this.setState({ receipt: purchase.transactionReceipt }, () => this.goToNext());
    } catch (err) {
      console.warn(err.code, err.message);
      Alert.alert(err.message);
    }
  }


  render() {
    return (
      <View>
        <Text>
          PURCHASES
        </Text>
        <Button
          title="Get Products"
          onPress={() => this.getItems()}
          buttonStyle={styles.button}
        />
        <Button
          title="Get Available Purchases"
          onPress={() => this.getItems()}
          buttonStyle={styles.button}
        />
      </View>
    );
  }
}
