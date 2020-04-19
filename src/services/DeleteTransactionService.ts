import { getRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import AppError from '../errors/AppError';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    const transactionRepository = getRepository(Transaction);
    const checkTransaction = await transactionRepository.findOne(id);
    if (!checkTransaction) {
      throw new AppError('Transaction not found', 204);
    }
    await transactionRepository.remove(checkTransaction);
  }
}

export default DeleteTransactionService;
