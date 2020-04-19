import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import CustomRepository from '../repositories/TransactionsRepository';
import CreateCategoryService from './CreateCategoryService';

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
    // TODO
    const customRepository = getCustomRepository(CustomRepository);
    const categoryRepository = getRepository(Category);

    const { total } = await customRepository.getBalance();
    if (type === 'outcome' && value > total) {
      throw new AppError('Insufficient funds');
    }

    // Check and creacte Category if not exists
    let category_id;
    const categoryFound = await categoryRepository.findOne({
      where: {
        title: category,
      },
    });
    if (!categoryFound) {
      const createCategoryService = new CreateCategoryService();
      const newCategory = await createCategoryService.execute(category);
      category_id = newCategory.id;
    } else {
      category_id = categoryFound.id;
    }

    const transaction = customRepository.create({
      title,
      value,
      type,
      category_id,
    });
    await customRepository.save(transaction);
    return transaction;
  }
}

export default CreateTransactionService;
