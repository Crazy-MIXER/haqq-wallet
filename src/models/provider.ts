import {ethers} from 'ethers';

import {generateUUID} from '@app/utils';

import {realm} from './index';

export type ProviderKeys = keyof Omit<Provider, 'id'>;

export class Provider extends Realm.Object {
  static schema = {
    name: 'Provider',
    properties: {
      id: 'string',
      name: 'string',
      ethRpcEndpoint: 'string',
      ethChainId: 'int',
      cosmosChainId: 'string',
      cosmosRestEndpoint: 'string',
      tmRpcEndpoint: 'string',
      explorer: 'string?',
      isEditable: 'bool',
    },
    primaryKey: 'id',
  };
  id!: string;
  name!: string;
  ethChainId!: number;
  ethRpcEndpoint!: string;
  cosmosChainId!: string;
  cosmosRestEndpoint!: string;
  tmRpcEndpoint!: string;
  explorer: string | undefined;
  isEditable!: boolean;

  get rpcProvider() {
    return new ethers.providers.StaticJsonRpcProvider(this.ethRpcEndpoint, {
      chainId: this.ethChainId,
      name: this.id,
    });
  }

  static create(params: Partial<Provider>) {
    let id = generateUUID();
    realm.write(() => {
      realm.create(Provider.schema.name, {
        ...params,
        tmRpcEndpoint: '',
        isEditable: true,
        id,
      });
    });

    return id;
  }

  static remove(id: string) {
    const obj = realm.objectForPrimaryKey<Provider>(Provider.schema.name, id);

    if (obj) {
      realm.write(() => {
        realm.delete(obj);
      });
    }
  }

  static getProviders() {
    return realm.objects<Provider>('Provider');
  }

  static getProvider(providerId: string) {
    return realm.objectForPrimaryKey<Provider>('Provider', providerId);
  }

  update(params: Partial<Provider>) {
    realm.write(() => {
      realm.create(
        Provider.schema.name,
        {
          ...this.toJSON(),
          ...params,
          isEditable: this.isEditable,
          id: this.id,
        },
        Realm.UpdateMode.Modified,
      );
    });
  }
}
