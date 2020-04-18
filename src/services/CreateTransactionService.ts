import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);

    if (type !== 'outcome' && type !== 'income') {
      throw new AppError('Invalid transaction type');
    }

    if (type === 'outcome') {
      const { total } = await transactionsRepository.getBalance();

      if (value > total) {
        throw new AppError('Balance is not enough for this transaction');
      }
    }

    const categoryFound = await categoriesRepository.findOne({
      where: { title: category },
    });

    let category_id = '';

    if (!categoryFound) {
      const newCategory = categoriesRepository.create({
        title: category,
      });

      await categoriesRepository.save(newCategory);

      category_id = newCategory.id;
    } else {
      category_id = categoryFound.id;
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
