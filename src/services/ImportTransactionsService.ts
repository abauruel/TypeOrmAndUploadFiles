import { getRepository, In } from 'typeorm';
import csvParse from 'csv-parse';
import fs from 'fs';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface CsvTransaction {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute(filePath: string): Promise<Transaction[]> {
    const categoryRepository = getRepository(Category);
    const transactionRepository = getRepository(Transaction);
    // TODO
    const contactReadStream = fs.createReadStream(filePath);
    const parse = csvParse({
      from_line: 2,
    });
    const parseCSV = contactReadStream.pipe(parse);
    const transactions: CsvTransaction[] = [];
    const categories: string[] = [];

    parseCSV.on('data', async line => {
      const [title, type, value, category] = line.map(
        (cell: string) => cell.trim,
      );
      if (!title || !type || !value) return;
      categories.push(category);
      transactions.push({
        title,
        type,
        value,
        category,
      });
    });
    await new Promise(resolve => parseCSV.on('end', resolve));

    const exitentCategories = await categoryRepository.find({
      where: {
        title: In(categories),
      },
    });

    const exitentCategoriesTitles = exitentCategories.map(title => title.title);
    const addCategoryTitles = categories
      .filter(category => !exitentCategoriesTitles.includes(category))
      .filter((value, index, self) => self.indexOf(value) === index);
    const newCategories = categoryRepository.create(
      addCategoryTitles.map(title => ({
        title,
      })),
    );
    const finalCategories = [...newCategories, ...exitentCategories];
    await categoryRepository.save(newCategories);
    const newtransactions = transactionRepository.create(
      transactions.map(transaction => ({
        title: transaction.title,
        value: transaction.value,
        type: transaction.type,
        category: finalCategories.find(
          category => category.title === transaction.category,
        ),
      })),
    );

    await transactionRepository.save(newtransactions);
    await fs.promises.unlink(filePath);
    return newtransactions;
  }
}

export default ImportTransactionsService;
