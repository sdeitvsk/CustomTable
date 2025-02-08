import { writeFileSync } from 'fs';
import { join } from 'path';

const banks = ['SBI', 'HDFC', 'ICICI', 'AXIS', 'PNB', 'BOB', 'UNION'];
const accountTypes = ['BANK', 'LT', 'ST', 'CASH', 'SAVINGS', 'CURRENT', 'LOAN'];
const statuses = ['active', 'pending', 'inactive'];

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
}

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function generateMockData(count = 300) {
  const data = [];
  
  for (let i = 0; i < count; i++) {
    const batchNo = Math.floor(i / 10) + 1; // Groups of 10 transactions per batch
    const bank = banks[Math.floor(Math.random() * banks.length)];
    const accountNo = Math.random().toString(36).substring(2, 8);
    
    data.push({
      BatchNo: batchNo,
      Date: randomDate(new Date(2023, 0, 1), new Date()),
      Descr: `${bank} TRANSACTION ${accountNo}`,
      AC_Sub: accountTypes[Math.floor(Math.random() * accountTypes.length)],
      ACNO: accountNo,
      Status: statuses[Math.floor(Math.random() * statuses.length)],
      Debit: randomNumber(1000, 2000000).toString(),
      Credit: randomNumber(100, 500000).toString()
    });
  }
  
  return data;
}

const mockData = generateMockData();
const filePath = join(process.cwd(), 'src', 'data', 'mockData.json');

writeFileSync(filePath, JSON.stringify({ transactions: mockData }, null, 2));