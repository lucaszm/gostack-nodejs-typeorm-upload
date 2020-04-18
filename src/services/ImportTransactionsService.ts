import path from 'path';
import fs from 'fs';

import neatCsv from 'neat-csv';
import Transaction from '../models/Transaction';

import uploadConfig from '../config/upload';
import CreateTransactionService from './CreateTransactionService';
import AppError from '../errors/AppError';

interface Request {
  importFileName: string;
}

class ImportTransactionsService {
  async execute({ importFileName }: Request): Promise<Transaction[]> {
    const createTransaction = new CreateTransactionService();

    const importFileNamePath = path.join(
      uploadConfig.directory,
      importFileName,
    );

    const importFileExists = await fs.promises.stat(importFileNamePath);
    const transactions: Transaction[] = [];

    if (!importFileExists) {
      throw new AppError('Import file not found');
    }

    const importFile = await fs.promises.readFile(importFileNamePath);
    const processedCSV = await neatCsv(importFile, {
      mapHeaders: ({ header, index: _ }) => header.toLowerCase().trim(),
      mapValues: ({ header: _, index: __, value }) => value.trim(),
    });

    await processedCSV.reduce(async (promiseAnterior, transactionCSV) => {
      await promiseAnterior;

      const transaction = await createTransaction.execute({
        category: transactionCSV.category,
        type: transactionCSV.type === 'income' ? 'income' : 'outcome',
        value: Number(transactionCSV.value),
        title: transactionCSV.title,
      });

      transactions.push(transaction);
    }, Promise.resolve());

    await fs.promises.unlink(importFileNamePath);

    return transactions;
  }
}

export default ImportTransactionsService;
