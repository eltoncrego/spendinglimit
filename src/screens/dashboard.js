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
  Keyboard,
  DeviceEventEmitter,
} from 'react-native';
import  FontAwesome, { Icons } from 'react-native-fontawesome';

const button_label = 'set new spending limit';
const add_button_label = 'add new transaction';
const confirm_button_label = 'confirm new transaction';
const cancel_button_label = 'nevermind';
const add_transaction_prompt = 'How much did you spend?';
const placeholder = 'e.g. 12.50';
const label1 = 'This will be subtracted from your spending limit';
const label2 = 'Until';
const cat1_label = 'savings';
const cat2_label = 'auto/transport';
const cat3_label = 'utilities';
const cat4_label = 'food/entertainment';
const cat5_label = 'health/personal care';
const cat6_label = 'custom';

export default class Dashboard extends Component {

  constructor(props) {
    super(props);
    this.keyboardHeight = new Animated.Value(0);
    this.state = {
      fade_animation: new Animated.Value(0),
      transactionShift: new Animated.Value(0),
      categoryButton: new Animated.Value(0),
      categoryIconSwitch: 0,
      spendinglimit: '',
      selectedCategory: -1,
      expiration: '',
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
    this.retrieveItem('expiration').then((data) => {
      console.log("Expiration synced: " + data);
      that.setState({
        expiration: data,
      });
    }).catch((error) => {
      alert(error.message);
    });
  }

  refreshTransactions() {
    const that = this;
    this.retrieveItem('currentTransactions').then((data) => {
      console.log("Transactions synced: ");
      console.log(JSON.parse(data));
      that.setState({
        currentTransactions: data == null ? [] : JSON.parse(data),
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
    AsyncStorage.clear();
    this.props.navigation.navigate('ChangeLimit', {
      onNavigate: () => {
        this.refreshSpendingLimit();
        this.refreshTransactions();
        this.refreshAmountSpent();
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
        category: this.state.selectedCategory,
      }
      this.state.currentTransactions.unshift(tempTransaction);
      const newSpending = parseFloat(this.state.amountSpent) + parseFloat(this.state.transactionAmount__f);
      this.setState({
        amountSpent: newSpending.toString(),
      })
      console.log(this.state.currentTransactions);
      this.closeNewTransaction();

      // Push spending data
      this.storeItem('amountSpent', newSpending.toString()).then(() => {
        console.log('spending successfully saved')
      }).catch((error) => {
        alert(error.message);
      });

      // Push transaction data
      this.storeItem('currentTransactions', JSON.stringify(this.state.currentTransactions)).then(() => {
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
    this.storeItem('amountSpent', newSpending.toString()).then(() => {
      console.log('spending successfully saved')
    }).catch((error) => {
      alert(error.message);
    });

    // Push transaction data
    this.storeItem('currentTransactions', JSON.stringify(this.state.currentTransactions)).then(() => {
      console.log('transactions successfully saved')
    }).catch((error) => {
      alert(error.message);
    });
  }

  toggleCategoryButton() {
    this.setState({
      categoryIconSwitch: !this.state.categoryIconSwitch
    });
    if(this.state.categoryButton._value <= 1){
      Animated.spring(
        this.state.categoryButton,
        {
          toValue: this.state.categoryButton._value == 0 ? 1 : 0,
          friction: 8,
        }
      ).start();
    } else {
      Animated.spring(
        this.state.categoryButton,
        {
          toValue: this.state.categoryButton._value != 0 ? 1 : 0,
          friction: 8,
        }
      ).start();
      this.setState({
        selectedCategory: -1,
      });
    }
  }

  setCategory(category_code) {
    Animated.spring(
      this.state.categoryButton,
      {
        toValue: category_code,
        friction: 8,
      }
    ).start();
    this.setState({
      categoryIconSwitch: !this.state.categoryIconSwitch,
      selectedCategory: category_code - 2,
    });
  }

  render() {

    var transactionTranslation = this.state.transactionShift.interpolate({
      inputRange: [0, 1],
      outputRange: [812, 0],
    });
    var transformTransaction = {transform: [{translateY: transactionTranslation}]};
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

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

    var categoryButtonColor = this.state.categoryButton.interpolate({
      inputRange: [0, 1, 2, 3, 4, 5, 6, 7],
      outputRange: [GLOBAL.COLOR.DARKGRAY, GLOBAL.COLOR.RED, GLOBAL.COLOR.TEEL, GLOBAL.COLOR.RUBY, GLOBAL.COLOR.SHADOW, GLOBAL.COLOR.RAJA, GLOBAL.COLOR.GRUILLO, GLOBAL.COLOR.LIGHTGRAY],
    });
    var categoryButtonSpin = this.state.categoryButton.interpolate({
      inputRange: [0, 1, 2, 3, 4, 5, 6, 7],
      outputRange: ['0deg', '720deg', '0deg', '0deg', '0deg', '0deg', '0deg', '0deg'],
    });
    var categorySpinTransform = {transform: [{rotateZ: categoryButtonSpin}]};
    const cats = [cat1_label, cat2_label, cat3_label, cat4_label, cat5_label, cat6_label]
    const cat_colors = [GLOBAL.COLOR.TEEL, GLOBAL.COLOR.RUBY, GLOBAL.COLOR.SHADOW, GLOBAL.COLOR.RAJA, GLOBAL.COLOR.GRUILLO, GLOBAL.COLOR.LIGHTGRAY]

    var buttonIcon = this.state.categoryIconSwitch == 0 ?
      <FontAwesome>{Icons.tag}</FontAwesome> : <FontAwesome>{Icons.times}</FontAwesome>;
    var categoriesForm = this.state.categoryIconSwitch == 0 ?
      null :
      <View>
        <TouchableOpacity
          style={[styles.category_button_wrapper, {
            backgroundColor: GLOBAL.COLOR.TEEL,
            marginTop: 16
          }]}
          onPress={() => this.setCategory(2)}
        >
          <Text style={styles.category_button_label}>{cat1_label}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.category_button_wrapper, {
            backgroundColor: GLOBAL.COLOR.RUBY,
            marginTop: 8
          }]}
          onPress={() => this.setCategory(3)}
        >
          <Text style={styles.category_button_label}>{cat2_label}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.category_button_wrapper, {
            backgroundColor: GLOBAL.COLOR.SHADOW,
            marginTop: 8
          }]}
          onPress={() => this.setCategory(4)}
        >
          <Text style={styles.category_button_label}>{cat3_label}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.category_button_wrapper, {
            backgroundColor: GLOBAL.COLOR.RAJA,
            marginTop: 8
          }]}
          onPress={() => this.setCategory(5)}
        >
          <Text style={styles.category_button_label}>{cat4_label}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.category_button_wrapper, {
            backgroundColor: GLOBAL.COLOR.GRUILLO,
            marginTop: 8
          }]}
          onPress={() => this.setCategory(6)}
        >
          <Text style={styles.category_button_label}>{cat5_label}</Text>
        </TouchableOpacity>
      </View>

      ;

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
                  <View style={styles.og_flatlist_items}>
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
                    item.category == -1 ? null :
                    <View style={[styles.flatlist_category_banner, {backgroundColor: item.category == -1 ? GLOBAL.COLOR.RED : cat_colors[item.category]}]}>
                      <Text style={styles.flatlist_category}>{cats[item.category]}</Text>
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
              <TouchableOpacity style={styles.category_button} onPress={() => this.toggleCategoryButton()}>
                <Animated.View style={[styles.category_container, {backgroundColor: categoryButtonColor}]}>
                  <Animated.Text style={[{color: GLOBAL.COLOR.WHITE, fontSize: 20, textAlign: 'center', margin: 0}, categorySpinTransform]}>
                    {buttonIcon}
                  </Animated.Text>
                </Animated.View>
              </TouchableOpacity>
            </View>
            <Text style={styles.prompt_label}>{label1}</Text>
            {categoriesForm}
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
  input: {
    // width: '100%',
    flex: 3,
    fontSize: 15,
    fontFamily: 'Open Sans',
    backgroundColor: 'rgba(52,46,55, 0.20)',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 4,
    color: GLOBAL.COLOR.DARKGRAY,
  },
  category_button: {
    flex: 1,
    marginLeft: 8,
    borderRadius: 4,
  },
  category_button_wrapper: {
    alignItems: 'center',
    width: '100%',
    backgroundColor: GLOBAL.COLOR.WHITE,
    padding: 4,
    paddingVertical: 10,
    borderRadius: 4,
  },
  category_button_label: {
    fontSize: 12,
    fontFamily: 'Open Sans',
    color: GLOBAL.COLOR.WHITE,
  },
  category_container: {
    flex: 1,
    padding: 16,
    borderRadius: 4,
  },

  flatlist_container: {
    flex: 1,
    paddingVertical: 16,
    alignSelf: 'stretch',
  },
  og_flatlist_items: {
    width: '100%',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  flatlist_item: {
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
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
  },
  flatlist_category_banner: {
    // width: '100%',
    alignSelf: 'flex-start',
    padding: 8,
    marginTop: 8,
    borderRadius: 4,
  },
  flatlist_category: {
    alignSelf: 'flex-start',
    color: GLOBAL.COLOR.WHITE,
    fontFamily: 'Open Sans',
    fontSize: 10,
  }
});
