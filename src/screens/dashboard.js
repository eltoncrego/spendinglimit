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
  TextInput,
  FlatList,
  Keyboard,
  DeviceEventEmitter,
} from 'react-native';
import  FontAwesome, { Icons } from 'react-native-fontawesome';

import {
  storeItem,
  retrieveItem,
  clearTransactions,
  clearExpirationData,
} from './../func/storage';

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const button_label = 'set new spending limit';
const add_button_label = 'add new transaction';
const confirm_button_label = 'confirm new transaction';
const cancel_button_label = 'nevermind';
const add_transaction_prompt = 'How much did you spend?';
const placeholder = 'e.g. 12.50';
const placeholder2 = 'Payee or Notes';
const label1 = 'This will be subtracted from your spending limit';
const label2 = 'Until';
const label3 = 'This will show below the transaction'

export default class Dashboard extends Component {

  constructor(props) {
    super(props);
    this.keyboardHeight = new Animated.Value(0);
    this.state = {
      fade_animation: new Animated.Value(0),
      transactionShift: new Animated.Value(0),
      spendinglimit: '',
      expiration: '',
      amountSpent: '0',
      transactionAmount__f: '',
      transactionNote__f: '',
      currentTransactions: [],
    };
  }

  retrieveSpendingLimit() {
    const that = this;
    retrieveItem('spendinglimit').then((data) => {
      console.log("Limit synced: " + data);
      that.setState({
        spendinglimit: data,
      });
    }).catch((error) => {
      alert(error.message);
    });
    retrieveItem('expiration').then((data) => {
      console.log("Expiration synced: " + data);
      that.setState({
        expiration: data,
      });
    }).catch((error) => {
      alert(error.message);
    });
  }

  retrieveTransactions() {
    const that = this;
    retrieveItem('currentTransactions').then((data) => {
      console.log("Transactions synced: ");
      console.log(JSON.parse(data));
      that.setState({
        currentTransactions: data == null ? [] : JSON.parse(data),
      });
    }).catch((error) => {
      alert(error.message);
    });
  }

  retrieveAmountSpent() {
    const that = this;
    retrieveItem('amountSpent').then((data) => {
      console.log("Spending synced: " + data);
      that.setState({
        amountSpent: data,
      });
    }).catch((error) => {
      alert(error.message);
    });
  }


  componentWillMount() {
    this.retrieveSpendingLimit();
    this.retrieveTransactions();
    this.retrieveAmountSpent();

    this.keyboardWillShowSub = Keyboard.addListener('keyboardWillShow', this.keyboardWillShow);
    this.keyboardWillHideSub = Keyboard.addListener('keyboardWillHide', this.keyboardWillHide);
  }

  componentDidMount() {
    var that = this;
    var QuickActions = require('react-native-quick-actions');

    // Add few actions
    QuickActions.setShortcutItems([
      {
        type: "newTransaction",
        title: "New Transaction",
        icon: "Add",
      },
      {
        type: 'changeSpendingLimit',
        title: "New Spending Limit",
        icon: "Compose",
      }
    ]);

    QuickActions.popInitialAction().then((data) => {
      if(data !== null){
        switch(data.type){
          case 'newTransaction':
            that.openNewTransaction();
            break;
          case 'changeSpendingLimit':
            that.changeSpendingLimit();
            break;
          default:
            break;
        }
      }
    }).catch(console.error);

    DeviceEventEmitter.addListener(
      'quickActionShortcut', function(data) {
        switch(data.type){
          case 'newTransaction':
            that.openNewTransaction();
            break;
          case 'changeSpendingLimit':
            that.changeSpendingLimit();
            break;
          default:
            break;
        }
      }
    );

    Animated.timing(
      this.state.fade_animation,
      {
        toValue: 1,
        duration: 500,
      }
    ).start();
  }

  componentWillUnmount() {
    this.keyboardWillShowSub.remove();
    this.keyboardWillHideSub.remove();
  }

  keyboardWillShow = (event) => {
    Animated.timing(this.keyboardHeight, {
      duration: event.duration,
      toValue: event.endCoordinates.height,
    }).start();
  };

  keyboardWillHide = (event) => {
    Animated.timing(this.keyboardHeight, {
      duration: event.duration,
      toValue: 0,
    }).start();
  };

  changeSpendingLimit() {
    var QuickActions = require('react-native-quick-actions');
    QuickActions.clearShortcutItems();
    clearExpirationData();
    this.props.navigation.navigate('ChangeLimit', {
      onNavigate: () => {
        this.retrieveSpendingLimit();
        this.retrieveTransactions();
        this.retrieveAmountSpent();
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
    Animated.spring(
      this.state.fade_animation,
      {
        toValue: .2,
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
    Animated.spring(
      this.state.fade_animation,
      {
        toValue: 1,
        friction: 8,
      }
    ).start();
    Keyboard.dismiss();
  }

  validateInput(str) {
    if (str == ''){
      alert('You cannot have an empty transaction amount!');
      return false;
    } else if (isNaN(str)) {
      alert('Please enter a valid number.');
      return false;
    } else if (parseFloat(str) < 0) {
      alert('Please enter a non-negative number.');
      return false;
    }
    return true;
  }

  addNewTransaction() {
    if(this.validateInput(this.state.transactionAmount__f)){
      const d = new Date();
      let tempTransaction = {
        date: d,
        amount: this.state.transactionAmount__f,
        note: this.state.transactionNote__f,
      }
      this.state.currentTransactions.unshift(tempTransaction);
      const newSpending = parseFloat(this.state.amountSpent) + parseFloat(this.state.transactionAmount__f);
      this.setState({
        amountSpent: newSpending.toString(),
      })
      console.log(this.state.currentTransactions);
      this.closeNewTransaction();

      // Push spending data
      storeItem('amountSpent', newSpending.toString()).then(() => {
        console.log('spending successfully saved')
      }).catch((error) => {
        alert(error.message);
      });

      // Push transaction data
      storeItem('currentTransactions', JSON.stringify(this.state.currentTransactions)).then(() => {
        console.log('transactions successfully saved')
      }).catch((error) => {
        alert(error.message);
      });
    }
  }

  deleteTransaction(item){
    console.log(item);
    this.state.currentTransactions.splice(this.state.currentTransactions.indexOf(item), 1);
    const newSpending = parseFloat(this.state.amountSpent) - parseFloat(item.amount);
    this.setState({
      amountSpent: newSpending.toString(),
    });

    // Push spending data
    storeItem('amountSpent', newSpending.toString()).then(() => {
      console.log('spending successfully saved')
    }).catch((error) => {
      alert(error.message);
    });

    // Push transaction data
    storeItem('currentTransactions', JSON.stringify(this.state.currentTransactions)).then(() => {
      console.log('transactions successfully saved')
    }).catch((error) => {
      alert(error.message);
    });
  }

  render() {

    var transactionTranslation = this.state.transactionShift.interpolate({
      inputRange: [0, 1],
      outputRange: [812, 0],
    });
    var transformTransaction = {transform: [{translateY: transactionTranslation}]};
    var bg_color = GLOBAL.COLOR.GREEN;
    var prompt_color = GLOBAL.COLOR.WHITE;
    var currentRatio = parseFloat(this.state.amountSpent)/parseFloat(this.state.spendinglimit);
    if((1-currentRatio) < .80){
      bg_color = GLOBAL.COLOR.YELLOW;
    }
    if ((1- currentRatio) < .40){
      bg_color = GLOBAL.COLOR.RED;
    }
    if ((1- currentRatio) <= 0){
      bg_color = GLOBAL.COLOR.DARKGRAY;
      prompt_color = GLOBAL.COLOR.RED;
    }

    var limitDifference = (parseFloat(this.state.spendinglimit) - parseFloat(this.state.amountSpent)).toFixed(2)
    var limitPrompt = limitDifference < 0 ?
      <Text style={[styles.prompt, {color: prompt_color}]}>${-limitDifference} over</Text>
      : <Text style={[styles.prompt, {color: prompt_color}]}>${limitDifference} left</Text>;

    return (
      <SafeAreaView style={[styles.container, {backgroundColor: bg_color}]}>
        <StatusBar barStyle='light-content' />
        <Animated.View style={[styles.view_container, {opacity: this.state.fade_animation, backgroundColor: bg_color}]}>
          <TouchableOpacity style={{alignSelf: 'flex-start'}} onPress={() => this.changeSpendingLimit()}>
            {limitPrompt}
          <Text style={styles.prompt_label2}>{label2} {months[(new Date(this.state.expiration)).getMonth()]} {(new Date(this.state.expiration)).getDate()}, {(new Date(this.state.expiration)).getFullYear()}</Text>
          </TouchableOpacity>
          <View style={styles.flatlist_container}>
            <FlatList
              style={styles.flatlist}
              data={this.state.currentTransactions}
              extraData={this.state}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({item}) =>
                <View style={styles.flatlist_item}>
                  <View style={styles.flatlist_item_wrapper}>
                    <View>
                      <Text style={styles.flatlist_date}>{months[(new Date(item.date)).getMonth()]} {(new Date(item.date)).getDate()}, {(new Date(item.date)).getFullYear()}</Text>
                      <Text style={styles.flatlist_dollarvalue}>(${parseFloat(item.amount).toFixed(2)})</Text>
                    </View>
                    <View>
                      <TouchableOpacity style={{marginHorizontal: 8}} onPress={() => this.deleteTransaction(item)}>
                        <Text style={{color: GLOBAL.COLOR.DARKGRAY, fontSize: 20}}>
                          <FontAwesome>{Icons.trash}</FontAwesome>
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  {
                    item.note == '' ? null :
                    <View style={styles.note_tags}>
                      <View style={styles.note_tag_item}>
                        <Text style={styles.note_tag_text}>{item.note.toUpperCase()}</Text>
                      </View>
                    </View>
                  }
                </View>}
              />
          </View>
          <View>
            <View style={styles.form}>
              <TouchableOpacity style={styles.button} onPress={() => this.openNewTransaction()}>
                <Text style={[styles.button_label, {color: GLOBAL.COLOR.DARKGRAY}]}>{add_button_label}</Text>
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
                keyboardType='numeric'
                style={styles.input}
                placeholder={placeholder}
                underlineColorAndroid={'rgba(0,0,0,0)'}
                onChangeText={(text) => {
                  this.setState({transactionAmount__f: text})
                }}
                onSubmitEditing={() => this.addNewTransaction()}/>
            </View>
            <Text style={styles.prompt_label}>{label1}</Text>

            <View style={styles.form}>
              <TextInput
                keyboardType='default'
                style={styles.input}
                placeholder={placeholder2}
                underlineColorAndroid={'rgba(0,0,0,0)'}
                onChangeText={(text) => {
                  this.setState({transactionNote__f: text})
                }}
                onSubmitEditing={() => this.addNewTransaction()}/>
            </View>
            <Text style={styles.prompt_label}>{label3}</Text>

            <Animated.View style={{marginBottom: this.keyboardHeight}}>
              <TouchableOpacity
                style={[styles.button, {
                  backgroundColor: GLOBAL.COLOR.GREEN,
                  marginTop: 32
                }]}
                onPress={() => this.addNewTransaction()}
              >
                <Text style={styles.button_label}>{confirm_button_label}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, {
                  backgroundColor: GLOBAL.COLOR.RED,
                  marginTop: 8,
                }]}
                onPress={() => this.closeNewTransaction()}
              >
                <Text style={styles.button_label}>{cancel_button_label}</Text>
              </TouchableOpacity>
            </Animated.View>
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
    paddingTop: 64,
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
  prompt_label2: {
    paddingTop: 4,
    fontSize: 15,
    alignSelf: 'flex-start',
    fontFamily: 'Open Sans',
    color: GLOBAL.COLOR.WHITE,
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
    color: GLOBAL.COLOR.WHITE,
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
  flatlist_item_wrapper: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  },
  note_tags: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  note_tag_item: {
    alignItems: 'flex-start',
    borderRadius: 4,
    backgroundColor: GLOBAL.COLOR.RED,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  note_tag_text: {
    color: GLOBAL.COLOR.WHITE,
    fontFamily: 'Open Sans',
    fontSize: 12,
  }
});
