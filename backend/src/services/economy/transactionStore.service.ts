import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import type { EconomyTransaction } from '../../types/economy.types.js';
import { logger } from '../../logger/logger.js';

const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);
const txFilePath = path.resolve(currentDir, '../../data/economy_transactions.json');

let writeQueue: Promise<void> = Promise.resolve();

async function ensureFile(): Promise<void> {
  const dirPath = path.dirname(txFilePath);
  await mkdir(dirPath, { recursive: true });
  try {
    await readFile(txFilePath, 'utf-8');
  } catch {
    logger.debug('economy_transactions.json not found, initializing');
    await writeFile(txFilePath, '[]', 'utf-8');
  }
}

async function readTx(): Promise<EconomyTransaction[]> {
  await ensureFile();
  const raw = await readFile(txFilePath, 'utf-8');
  const parsed = JSON.parse(raw) as unknown;
  return Array.isArray(parsed) ? (parsed as EconomyTransaction[]) : [];
}

async function writeTx(txs: EconomyTransaction[]): Promise<void> {
  await writeFile(txFilePath, JSON.stringify(txs, null, 2), 'utf-8');
}

function enqueue<T>(op: () => Promise<T>): Promise<T> {
  const result = writeQueue.then(op);
  writeQueue = result.then(() => undefined, () => undefined);
  return result;
}

export type AppendTxInput = {
  userId: string;
  kind: 'spend' | 'reward';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  reason: string;
  gameId: string;
  sessionId: string;
  guestId?: string;
};

export async function appendTransaction(input: AppendTxInput): Promise<EconomyTransaction> {
  return enqueue(async () => {
    const txs = await readTx();
    const tx: EconomyTransaction = {
      txId: randomUUID(),
      userId: input.userId,
      kind: input.kind,
      amount: input.amount,
      balanceBefore: input.balanceBefore,
      balanceAfter: input.balanceAfter,
      reason: input.reason,
      gameId: input.gameId,
      sessionId: input.sessionId,
      ...(input.guestId && { guestId: input.guestId }),
      createdAt: new Date().toISOString(),
    };
    txs.push(tx);
    await writeTx(txs);
    return tx;
  });
}
