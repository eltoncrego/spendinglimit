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
  AsyncStorage
} from 'react-native';

const spendingPrompt = 'What is your spending limit?'
const label1 = 'This amount will be used for one week.'
const placeholder = 'eg. $120.00'
const button_label = 'lets save money!'

export default class ChangeLimit extends Component {

  constructor(props) {
    super(props);
    this.state = {
      spendinglimit__f: '',
      fade_animation: new Animated.Value(0),
    };
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

  validateSpendingLimit(limit) {
    if (limit == ''){
      alert('You cannot have an empty spending limit!');
      return false;
    } else if (isNaN(limit)) {
      alert('Please enter a valid number.');
      return false;
    }
    return true;
  }

  async storeItem(key, item) {
    try {
      await AsyncStorage.setItem(key, item);
      return;
    } catch (error) {
      return error;
    }
  }

  handleNewSpendingLimit() {
    if (this.validateSpendingLimit(this.state.spendinglimit__f)){
      var that = this;
      this.storeItem('spendinglimit', this.state.spendinglimit__f).then(() => {
        if(that.props.navigation.state.params != null){
          that.props.navigation.state.params.onNavigate();
        }
        that.props.navigation.navigate('Dashboard', { data: { spendinglimit: this.state.spendinglimit__f} });
      }).catch((error) => {
        alert(error.message);
      });
    }
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle='light-content'/>
        <Animated.View style={[styles.view_container, {opacity: this.state.fade_animation}]}>
          <View>
            <Text style={styles.prompt}>{spendingPrompt}</Text>
            <View style={styles.form}>
              <TextInput
                keyboardType='numeric'
                style={styles.input}
                placeholder={placeholder}
                onChangeText={(text) => {
                  this.setState({spendinglimit__f: text})
                }}
                onSubmitEditing={() => this.handleNewSpendingLimit()}/>
            </View>
            <Text style={styles.prompt_label}>{label1}</Text>
          </View>
          <View style={styles.form}>
            <TouchableOpacity style={styles.button} onPress={() => this.handleNewSpendingLimit()}>
              <Text style={styles.button_label}>{button_label}</Text>
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
    fontFamily: 'Montserrat',
    fontWeight: '900',
    color: GLOBAL.COLOR.WHITE,
  },
  prompt_label: {
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
    backgroundColor: GLOBAL.COLOR.WHITE,
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
  }
});
