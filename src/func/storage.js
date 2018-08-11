import { AsyncStorage } from 'react-native';

export async function storeItem(key, item) {
  try {
    await AsyncStorage.setItem(key, item);
    return;
  } catch (error) {
    return error;
  }
}

export async function retrieveItem(key) {
  try {
    const item =  await AsyncStorage.getItem(key);
    return item;
  } catch (error) {
    return error;
  }
}

export function clearExpirationData() {
  AsyncStorage.removeItem('spendinglimit');
  AsyncStorage.removeItem('amountSpent');
  AsyncStorage.removeItem('expiration');
}

export function clearTransactions() {
  AsyncStorage.removeItem('currentTransactions');
  AsyncStorage.removeItem('amountSpent');
}
