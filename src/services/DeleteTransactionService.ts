import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  id: string;
}

class DeleteTransactionService {
  public async execute({ id }: Request): Promise<void> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const transactionDeleteResult = await transactionsRepository.delete(id);

    if (transactionDeleteResult.affected === 0) {
      throw new AppError('Transaction not found');
    }
  }
}

export default DeleteTransactionService;
