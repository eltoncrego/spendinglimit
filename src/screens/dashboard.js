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
  TextInput
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
      spendinglimit: 0,
      currentTransactions: [],
    };
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
      that.setState({
        spendinglimit: data,
      });
    }).catch((error) => {
      alert(error.message);
    });
  }

  componentWillMount() {
    this.refreshSpendingLimit();
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
    this.props.navigation.navigate('ChangeLimit', {
      onNavigate: () => this.refreshSpendingLimit(),
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
  }

  render() {

    var transactionTranslation = this.state.transactionShift.interpolate({
      inputRange: [0, 1],
      outputRange: [812, 0],
    });
    var transformTransaction = {transform: [{translateY: transactionTranslation}]};

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle='light-content' />
        <Animated.View style={[styles.view_container, {opacity: this.state.fade_animation}]}>
          <TouchableOpacity style={{alignSelf: 'flex-start'}} onPress={() => this.changeSpendingLimit()}>
            <Text style={styles.prompt}>${parseInt(this.state.spendinglimit).toFixed(2)} left</Text>
          </TouchableOpacity>
          <Text>{this.state.currentTransactions}</Text>
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
                keyboardType='numeric'
                style={styles.input}
                placeholder={placeholder}
                onChangeText={(text) => {
                  this.setState({spendinglimit__f: text})
                }}/>
            </View>
            <Text style={styles.prompt_label}>{label1}</Text>
            <TouchableOpacity
              style={[styles.button, {
                backgroundColor: GLOBAL.COLOR.GREEN,
                marginTop: 32
              }]}
              onPress={() => this.closeNewTransaction()}
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
    backgroundColor: GLOBAL.COLOR.GREEN,
  },
  view_container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: GLOBAL.COLOR.GREEN,
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
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    color: GLOBAL.COLOR.DARKGRAY,
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
  },
  transaction_panel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    backgroundColor: GLOBAL.COLOR.WHITE,
  },
  transaction_form: {
    padding: 32,
  },
});
