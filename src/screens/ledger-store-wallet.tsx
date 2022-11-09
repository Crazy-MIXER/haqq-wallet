import React, {useEffect} from 'react';

import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {View} from 'react-native';

import {useWallets} from '../contexts/wallets';
import {captureException} from '../helpers';
import {showModal} from '../helpers/modal';
import {RootStackParamList} from '../types';
import {sleep} from '../utils';

export const LedgerStoreWalletScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'ledgerStore'>>();
  const wallets = useWallets();

  useEffect(() => {
    showModal('loading', {text: 'Wallet saving in progress'});
  }, []);

  useEffect(() => {
    setTimeout(() => {
      const actions = [sleep(1000)];

      actions.push(
        wallets.addWalletFromLedger(
          {
            address: route.params.address,
            deviceId: route?.params?.deviceId,
            deviceName: route?.params?.deviceName,
          },
          route?.params?.deviceName,
        ),
      );

      Promise.all(actions)
        .then(() => {
          navigation.navigate('ledgerFinish');
        })
        .catch(error => {
          switch (error) {
            case 'wallet_already_exists':
              showModal('error-account-added');
              navigation.getParent()?.goBack();
              break;
            default:
              if (error instanceof Error) {
                showModal('error-create-account');
                captureException(error, 'ledgerStore');
                navigation.getParent()?.goBack();
              }
          }
        });
    }, 350);
  }, [navigation, route, wallets]);

  return <View />;
};
