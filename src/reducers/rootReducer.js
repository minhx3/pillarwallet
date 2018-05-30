// @flow
import { combineReducers } from 'redux';
import navigationReducer from './navigationReducer';
import walletReducer from './walletReducer';
import assetsReducer from './assetsReducer';
import appSettingsReducer from './appSettingsReducer';
import ratesReducer from './ratesReducer';
import userReducer from './userReducer';

export default combineReducers({
  navigation: navigationReducer,
  wallet: walletReducer,
  assets: assetsReducer,
  appSettings: appSettingsReducer,
  rates: ratesReducer,
  user: userReducer,
});
