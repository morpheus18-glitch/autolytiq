import { randomUUID } from 'node:crypto';

interface Job<T> {
  id: string;
  attemptsRemaining: number;
  execute: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: unknown) => void;
}

const queue: Job<unknown>[] = [];
let activeJobs = 0;
const MAX_CONCURRENCY = 2;

function scheduleNext(): void {
  if (activeJobs >= MAX_CONCURRENCY) {
    return;
  }

  const job = queue.shift();
  if (!job) {
    return;
  }

  activeJobs += 1;

  job
    .execute()
    .then((result) => {
      job.resolve(result);
    })
    .catch((error) => {
      if (job.attemptsRemaining > 0) {
        job.attemptsRemaining -= 1;
        queue.push(job);
      } else {
        job.reject(error);
      }
    })
    .finally(() => {
      activeJobs -= 1;
      scheduleNext();
    });
}

export function enqueueDeskingJob<T>(execute: () => Promise<T>, options: { retries?: number } = {}): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const job: Job<T> = {
      id: randomUUID(),
      attemptsRemaining: options.retries ?? 2,
      execute,
      resolve,
      reject,
    };
    queue.push(job);
    scheduleNext();
  });
}

export function pendingDeskingJobs(): number {
  return queue.length + activeJobs;
}
