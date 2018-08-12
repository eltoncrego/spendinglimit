GLOBAL = require('./../global-color');

import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Animated,
  StatusBar,
  AsyncStorage,
  Keyboard,
  DeviceEventEmitter,
  QuickActions,
} from 'react-native';

import { storeItem, clearTransactions } from './../func/storage';

import Reactotron from 'reactotron-react-native';

const spendingPrompt = 'What is your spending limit?';
const placeholder = 'e.g. $120.00';
const button_label = 'let\'s save money!';
const term_label = 'For how long?'
const term0 = 'week';
const term1 = '2 weeks';
const term2 = 'end of month';

export default class ChangeLimit extends Component {

  constructor(props) {
    super(props);
    this.keyboardHeight = new Animated.Value(0);
    this.textTransform = new Animated.Value(0);
    this.state = {
      spendinglimit__f: '',
      selectedTerm: new Animated.Value(0),
      fade_animation: new Animated.Value(0),
    };
  }

  componentWillMount() {
    this.keyboardWillShowSub = Keyboard.addListener('keyboardWillShow', this.keyboardWillShow);
    this.keyboardWillHideSub = Keyboard.addListener('keyboardWillHide', this.keyboardWillHide);
  }

  componentDidMount() {
    var QuickActions = require('react-native-quick-actions');
    QuickActions.clearShortcutItems();
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
    Animated.timing(this.textTransform, {
      duration: event.duration,
      toValue: 1,
    }).start();
  };

  keyboardWillHide = (event) => {
    Animated.timing(this.keyboardHeight, {
      duration: event.duration,
      toValue: 0,
    }).start();
    Animated.timing(this.textTransform, {
      duration: event.duration,
      toValue: 0,
    }).start();
  };


  validateSpendingLimit(limit) {
    if (limit == ''){
      alert('You cannot have an empty spending limit!');
      return false;
    } else if (isNaN(limit)) {
      alert('Please enter a valid number.');
      return false;
    } else if (parseFloat(limit) < 0) {
      alert('Please enter a non-negative number.');
      return false;
    }
    return true;
  }

  changeSelectedTerm(term){
    Animated.timing(
      this.state.selectedTerm,{
        duration: 300,
        toValue: term,
    }).start();
  }

  handleNewSpendingLimit() {
    clearTransactions();
    if (this.validateSpendingLimit(this.state.spendinglimit__f)){
      var that = this;
      var newExpiration = new Date();
      if(this.state.selectedTerm._value == 0){
        newExpiration = new Date((new Date()).getTime() + 7 * 24 * 60 * 60 * 1000);
      } else if (this.state.selectedTerm._value == 1){
          newExpiration = new Date((new Date()).getTime() + 7 * 24 * 60 * 60 * 1000 * 2);
      } else {
        var yearCode = newExpiration.getFullYear();
        var monthCode = newExpiration.getMonth();
        newExpiration = new Date(yearCode, monthCode + 1, 0);
      }
      storeItem('spendinglimit', this.state.spendinglimit__f).then(() => {
        storeItem('amountSpent', '0').then(() => {
          storeItem('expiration', newExpiration).then(() => {
            if(that.props.navigation.state.params != null){
              that.props.navigation.state.params.onNavigate();
            }
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
            that.props.navigation.navigate('Dashboard', { data: { spendinglimit: this.state.spendinglimit__f} });
          }).catch((error) => {
            alert(error.message);
          });
        }).catch((error) => {
          alert(error.message);
        });
      }).catch((error) => {
        alert(error.message);
      });
    }
  }

  render() {

    var promptSize = this.textTransform.interpolate({
      inputRange: [0, 1],
      outputRange: [40, 20],
    });

    var selected0 = this.state.selectedTerm.interpolate({
      inputRange: [0, 1, 2],
      outputRange: [GLOBAL.COLOR.WHITE, GLOBAL.COLOR.GREEN, GLOBAL.COLOR.GREEN],
    });

    var selected0_text = this.state.selectedTerm.interpolate({
      inputRange: [0, 1, 2],
      outputRange: [GLOBAL.COLOR.DARKGRAY, GLOBAL.COLOR.WHITE, GLOBAL.COLOR.WHITE],
    });

    var selected1 = this.state.selectedTerm.interpolate({
      inputRange: [0, 1, 2],
      outputRange: [GLOBAL.COLOR.GREEN, GLOBAL.COLOR.WHITE, GLOBAL.COLOR.GREEN],
    });

    var selected1_text = this.state.selectedTerm.interpolate({
      inputRange: [0, 1, 2],
      outputRange: [GLOBAL.COLOR.WHITE, GLOBAL.COLOR.DARKGRAY, GLOBAL.COLOR.WHITE],
    });

    var selected2 = this.state.selectedTerm.interpolate({
      inputRange: [0, 1, 2],
      outputRange: [GLOBAL.COLOR.GREEN, GLOBAL.COLOR.GREEN, GLOBAL.COLOR.WHITE],
    });

    var selected2_text = this.state.selectedTerm.interpolate({
      inputRange: [0, 1, 2],
      outputRange: [GLOBAL.COLOR.WHITE, GLOBAL.COLOR.WHITE, GLOBAL.COLOR.DARKGRAY],
    });

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle='light-content'/>
        <Animated.View style={[styles.view_container, {opacity: this.state.fade_animation}]}>
          <View>
            <Animated.Text style={[styles.prompt, {fontSize: promptSize}]}>{spendingPrompt}</Animated.Text>
            <View style={styles.form}>
              <TextInput
                keyboardType='numeric'
                style={styles.input}
                placeholder={placeholder}
                underlineColorAndroid={'rgba(0,0,0,0)'}
                onChangeText={(text) => {
                  this.setState({spendinglimit__f: text})
                }}
                onSubmitEditing={() => this.handleNewSpendingLimit()}/>
            </View>
            <Animated.Text style={styles.prompt_label}>{term_label}</Animated.Text>
            <View style={styles.form}>
              <View style={styles.term_selector_wrapper}>
                <TouchableOpacity onPress={() => this.changeSelectedTerm(0)} style={styles.term_option}>
                  <Animated.Text style={[styles.term_option_text, {color: selected0_text, backgroundColor: selected0}]}>{term0.toUpperCase()}</Animated.Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.changeSelectedTerm(1)} style={[styles.term_option]}>
                  <Animated.Text style={[styles.term_option_text, {color: selected1_text, backgroundColor: selected1}]}>{term1.toUpperCase()}</Animated.Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.changeSelectedTerm(2)} style={[styles.term_option]}>
                  <Animated.Text style={[styles.term_option_text, {color: selected2_text, backgroundColor: selected2}]}>{term2.toUpperCase()}</Animated.Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <Animated.View style={[styles.form, {marginBottom: this.keyboardHeight}]}>
            <TouchableOpacity style={styles.button} onPress={() => this.handleNewSpendingLimit()}>
              <Text style={styles.button_label}>{button_label}</Text>
            </TouchableOpacity>
          </Animated.View>
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
    backgroundColor: GLOBAL.COLOR.GREEN,
  },
  view_container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: GLOBAL.COLOR.GREEN,
    padding: 32,
    paddingTop: 64,
  },
  prompt: {
    textAlign: 'left',
    fontFamily: 'Montserrat',
    fontWeight: '900',
    color: GLOBAL.COLOR.WHITE,
  },
  prompt_label: {
    marginTop: 16,
    fontSize: 15,
    alignSelf: 'flex-start',
    fontFamily: 'Montserrat',
    fontWeight: '900',
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
    backgroundColor: GLOBAL.COLOR.WHITE,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 4,
    color: GLOBAL.COLOR.DARKGRAY,
  },
  term_selector_wrapper: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderColor: GLOBAL.COLOR.WHITE,
    borderWidth: 2,
    borderRadius: 4,
    padding: 2,
  },
  term_option: {
    borderRadius: 4,
  },
  term_option_text: {
    color: GLOBAL.COLOR.WHITE,
    fontFamily: 'Open Sans',
    fontSize: 15,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  button: {
    alignItems: 'center',
    width: '100%',
    backgroundColor: GLOBAL.COLOR.WHITE,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  button_label: {
    fontSize: 15,
    fontFamily: 'Open Sans',
    color: GLOBAL.COLOR.DARKGRAY,
  }
});
