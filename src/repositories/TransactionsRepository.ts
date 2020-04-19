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
    const transactions = await this.find();
    const { income, outcome } = transactions.reduce(
      (acc, curr) => {
        // acc[curr.type] =
        //   Number(acc[curr.type]) + Number(curr.value) || Number(curr.value);
        // return acc;
        switch (curr.type) {
          case 'income':
            acc.income += Number(curr.value);
            break;
          case 'outcome':
            acc.outcome += Number(curr.value);
            break;
          default:
            break;
        }
        return acc;
      },
      { income: 0, outcome: 0, total: 0 },
    );
    const total = income - outcome;

    // const balance = { income, outcome, total: income - outcome };
    return { income, outcome, total };
  }
}

export default TransactionsRepository;
