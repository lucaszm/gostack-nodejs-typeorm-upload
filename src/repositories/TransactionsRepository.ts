import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const income = (
      await this.find({
        where: {
          type: 'income',
        },
      })
    ).reduce((total, { value }) => total + value, 0);

    const outcome = (
      await this.find({
        where: {
          type: 'outcome',
        },
      })
    ).reduce((total, { value }) => total + value, 0);

    const balance: Balance = { income, outcome, total: income - outcome };

    return balance;
  }
}

export default TransactionsRepository;
