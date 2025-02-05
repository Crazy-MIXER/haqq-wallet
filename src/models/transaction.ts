import {
  TransactionReceipt,
  TransactionResponse,
} from '@ethersproject/abstract-provider';
import {utils} from 'ethers';

import {calcFee, captureException} from '@app/helpers';
import {realm} from '@app/models/index';

export class Transaction extends Realm.Object {
  static schema = {
    name: 'Transaction',
    properties: {
      hash: 'string',
      account: 'string',
      raw: 'string',
      from: 'string',
      to: 'string',
      value: 'double',
      fee: 'double',
      createdAt: 'date',
      confirmed: 'bool',
      providerId: 'string',
    },
    primaryKey: 'hash',
  };
  hash!: string;
  account!: string;
  raw!: string;
  from!: string;
  to!: string;
  value!: number;
  fee!: number;
  createdAt!: Date;
  confirmed!: boolean;
  providerId!: string;

  get feeFormatted() {
    return this.fee.toFixed(15);
  }

  static getAll() {
    return realm.objects<Transaction>(Transaction.schema.name);
  }

  static remove(id: string) {
    const obj = Transaction.getById(id);

    if (obj) {
      realm.write(() => {
        realm.delete(obj);
      });
    }
  }

  static getById(id: string) {
    return realm.objectForPrimaryKey<Transaction>(Transaction.schema.name, id);
  }

  static removeAll() {
    const transactions = realm.objects<Transaction>(Transaction.schema.name);

    for (const transaction of transactions) {
      realm.write(() => {
        realm.delete(transaction);
      });
    }
  }

  static createTransaction(
    transaction: TransactionResponse,
    providerId: string,
    fee: number = 0,
  ) {
    realm.write(() => {
      realm.create('Transaction', {
        hash: transaction.hash,
        account: transaction.from,
        raw: JSON.stringify(transaction),
        createdAt: new Date(),
        from: transaction.from,
        to: transaction.to,
        value: parseFloat(utils.formatEther(transaction.value)),
        fee: fee,
        confirmed: false,
        providerId,
      });
    });
  }

  setConfirmed(receipt: TransactionReceipt) {
    try {
      realm.write(() => {
        this.confirmed = true;
        this.fee = calcFee(
          receipt.effectiveGasPrice ?? 7,
          receipt.cumulativeGasUsed,
        );
      });
    } catch (e) {
      captureException(e, 'Transaction.setConfirmed', {
        receipt: JSON.stringify(receipt),
      });
    }
  }
}
