import { Router } from 'express';
import { getCustomRepository } from 'typeorm';

import multer from 'multer';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';
import multerConfig from '../config/multer';

const upload = multer(multerConfig);
const transactionsRouter = Router();

transactionsRouter.get('/', async (request, response) => {
  const transactionCustomRepository = getCustomRepository(
    TransactionsRepository,
  );
  const transactions = await transactionCustomRepository.find();
  const balance = await transactionCustomRepository.getBalance();
  return response.json({ transactions, balance });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;
  const createRepositoryService = new CreateTransactionService();
  const transaction = await createRepositoryService.execute({
    title,
    value,
    type,
    category,
  });
  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;
  const deletetransactionService = new DeleteTransactionService();
  await deletetransactionService.execute(id);
  return response.status(204).send();
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const importTransactionsService = new ImportTransactionsService();
    const transaction = await importTransactionsService.execute(
      request.file.path,
    );
    response.json(transaction);
  },
);

export default transactionsRouter;
