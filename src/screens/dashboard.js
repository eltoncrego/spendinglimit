GLOBAL = require('./../global-color');

import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  StatusBar,
  AsyncStorage,
  TextInput,
  FlatList,
} from 'react-native';

const button_label = 'set new spending limit';
const add_button_label = 'add new transaction';
const confirm_button_label = 'confirm new transaction';
const add_transaction_prompt = 'How much did you spend?';
const placeholder = '12.50';
const label1 = 'This will be subtracted from your spending limit';

export default class Dashboard extends Component {

  constructor(props) {
    super(props);
    this.state = {
      fade_animation: new Animated.Value(0),
      transactionShift: new Animated.Value(0),
      spendinglimit: '',
      amountSpent: '0',
      transactionAmount__f: '',
      currentTransactions: [],
    };
  }

  async storeItem(key, item) {
    try {
      await AsyncStorage.setItem(key, item);
      return;
    } catch (error) {
      return error;
    }
  }

  async retrieveItem(key) {
    try {
      const item =  await AsyncStorage.getItem(key);
      return item;
    } catch (error) {
      return error;
    }
  }

  refreshSpendingLimit() {
    const that = this;
    this.retrieveItem('spendinglimit').then((data) => {
      console.log("Limit synced: " + data);
      that.setState({
        spendinglimit: data,
      });
    }).catch((error) => {
      alert(error.message);
    });
  }

  refreshTransactions() {
    const that = this;
    this.retrieveItem('currentTransactions').then((data) => {
      console.log("Transactions synced: " + JSON.parse(data));
      that.setState({
        currentTransactions: JSON.parse(data),
      });
    }).catch((error) => {
      alert(error.message);
    });
  }

  refreshAmountSpent() {
    const that = this;
    this.retrieveItem('amountSpent').then((data) => {
      console.log("Spending synced: " + data);
      that.setState({
        amountSpent: data,
      });
    }).catch((error) => {
      alert(error.message);
    });
  }

  componentWillMount() {
    this.refreshSpendingLimit();
    this.refreshTransactions();
    this.refreshAmountSpent();
  }

  componentDidMount() {
    Animated.timing(
      this.state.fade_animation,
      {
        toValue: 1,
        duration: 500,
      }
    ).start();
  }

  changeSpendingLimit() {
    AsyncStorage.clear();
    this.props.navigation.navigate('ChangeLimit', {
      onNavigate: () => {
        this.refreshSpendingLimit();
        this.refreshTransactions();
      }
    });
  }

  openNewTransaction() {
    Animated.spring(
      this.state.transactionShift,
      {
        toValue: 1,
        friction: 8,
      }
    ).start();
  }

  closeNewTransaction() {
    Animated.spring(
      this.state.transactionShift,
      {
        toValue: 0,
        friction: 8,
      }
    ).start();
    this.clearTransactionPanel();
  }

  validateInput(str) {
    if (str == ''){
      alert('You cannot have an empty transaction amount!');
      return false;
    } else if (isNaN(str)) {
      alert('Please enter a valid number.');
      return false;
    }
    return true;
  }

  clearTransactionPanel() {
    this.refs.input__f.setNativeProps({text: ''});
    this.setState({
      transactionAmount__f: '',
    })
  }

  addNewTransaction() {
    if(this.validateInput(this.state.transactionAmount__f)){
      const d = new Date();
      let tempTransaction = {
        date: d,
        amount: this.state.transactionAmount__f,
      }
      this.state.currentTransactions.unshift(tempTransaction);
      this.setState({
        currentTransactions: this.state.currentTransactions,
        amountSpent: parseFloat(this.state.amountSpent) + parseFloat(this.state.transactionAmount__f),
      })
      console.log(this.state.currentTransactions);
      this.closeNewTransaction();
    }
  }

  render() {

    var transactionTranslation = this.state.transactionShift.interpolate({
      inputRange: [0, 1],
      outputRange: [812, 0],
    });
    var transformTransaction = {transform: [{translateY: transactionTranslation}]};
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var bg_color = GLOBAL.COLOR.GREEN;
    var currentRatio = parseFloat(this.state.amountSpent)/parseFloat(this.state.spendinglimit);
    if((1-currentRatio) < .80){
      bg_color = GLOBAL.COLOR.YELLOW;
    }
    if ((1- currentRatio) < .40){
      bg_color = GLOBAL.COLOR.RED;
    }

    return (
      <SafeAreaView style={[styles.container, {backgroundColor: bg_color}]}>
        <StatusBar barStyle='light-content' />
        <Animated.View style={[styles.view_container, {opacity: this.state.fade_animation, backgroundColor: bg_color}]}>
          <TouchableOpacity style={{alignSelf: 'flex-start'}} onPress={() => this.changeSpendingLimit()}>
            <Text style={styles.prompt}>${
                (parseFloat(this.state.spendinglimit) - parseFloat(this.state.amountSpent)).toFixed(2)
            } left</Text>
          </TouchableOpacity>
          <View style={styles.flatlist_container}>
            <FlatList
              style={styles.flatlist}
              data={this.state.currentTransactions}
              extraData={this.state}
              keyExtractor={(item, index) => index}
              renderItem={({item}) =>
                <View style={styles.flatlist_item}>
                  <Text style={styles.flatlist_date}>{months[item.date.getMonth()]} {item.date.getDate()}, {item.date.getFullYear()}</Text>
                  <Text style={styles.flatlist_dollarvalue}>(${parseFloat(item.amount).toFixed(2)})</Text>
                </View>}
              />
          </View>
          <View>
            <View style={styles.form}>
              <TouchableOpacity style={styles.button} onPress={() => this.openNewTransaction()}>
                <Text style={styles.button_label}>{add_button_label}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        <Animated.View style={[styles.transaction_panel, transformTransaction]}>
          <View style={styles.transaction_form}>
            <Text style={[styles.prompt, {
                fontSize: 20,
                color: GLOBAL.COLOR.DARKGRAY
            }]}>
              {add_transaction_prompt}
            </Text>
            <View style={styles.form}>
              <TextInput
                ref='input__f'
                keyboardType='numeric'
                style={styles.input}
                placeholder={placeholder}
                onChangeText={(text) => {
                  this.setState({transactionAmount__f: text})
                }}
                onSubmitEditing={() => this.addNewTransaction()}/>
            </View>
            <Text style={styles.prompt_label}>{label1}</Text>
            <TouchableOpacity
              style={[styles.button, {
                backgroundColor: GLOBAL.COLOR.GREEN,
                marginTop: 32
              }]}
              onPress={() => this.addNewTransaction()}
            >
              <Text style={styles.button_label}>{confirm_button_label}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  view_container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 32,
  },
  prompt: {
    fontSize: 40,
    textAlign: 'left',
    alignSelf: 'flex-start',
    fontFamily: 'Montserrat',
    fontWeight: '900',
    color: GLOBAL.COLOR.WHITE,
  },
  prompt_label: {
    paddingTop: 4,
    fontSize: 10,
    alignSelf: 'flex-start',
    fontFamily: 'Open Sans',
    color: GLOBAL.COLOR.DARKGRAY,
  },
  form: {
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    fontSize: 15,
    fontFamily: 'Open Sans',
    backgroundColor: 'rgba(52,46,55, 0.20)',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 4,
    color: GLOBAL.COLOR.DARKGRAY,
  },
  button: {
    alignItems: 'center',
    width: '100%',
    backgroundColor: GLOBAL.COLOR.WHITE,
    padding: 16,
    borderRadius: 4,
  },
  button_label: {
    fontSize: 15,
    fontFamily: 'Open Sans',
    color: GLOBAL.COLOR.DARKGRAY,
  },
  transaction_panel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    backgroundColor: GLOBAL.COLOR.WHITE,
    shadowColor: GLOBAL.COLOR.DARKGRAY,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.20,
    shadowRadius: 4,
  },
  transaction_form: {
    padding: 32,
  },

  flatlist_container: {
    flex: 1,
    paddingVertical: 16,
    alignSelf: 'stretch',
  },
  flatlist_item: {
    width: '100%',
    backgroundColor: GLOBAL.COLOR.WHITE,
    padding: 16,
    marginTop: 8,
    borderRadius: 4,
    shadowColor: GLOBAL.COLOR.DARKGRAY,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.20,
    shadowRadius: 4,
  },
  flatlist_dollarvalue: {
    color: GLOBAL.COLOR.RED,
    fontFamily: 'Montserrat',
    fontWeight: '900',
    fontSize: 20,
  },
  flatlist_date: {
    color: GLOBAL.COLOR.DARKGRAY,
    fontFamily: 'Open Sans',
    fontSize: 10,
  }
});
