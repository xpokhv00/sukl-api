import cron, { ScheduledTask } from 'node-cron';
import { dataLoaderConfig } from '../config/dataLoaderConfig';
import {
  downloadAndLoadDLP,
  downloadAndLoadMR,
  downloadAndLoadREG,
  downloadAndLoadLEKARNY,
  downloadAndLoadEPOUKAZ,
  downloadAndLoadOPVYJIMKY,
  downloadAndLoadCEDI,
  downloadAndLoadZPROSTRED,
  downloadAndLoadLEK13,
  downloadAndLoadDIS13,
  downloadAndLoadREG13,
  downloadAndLoadERECEPT,
  downloadAndLoadPOVINNOST_DODAVEK,
} from '../loaders/downloadAndLoad';

interface ScheduledJob {
  name: string;
  task: ScheduledTask | null;
  cronExpression: string;
  lastRun?: Date;
  lastError?: Error;
}

class DataLoaderScheduler {
  private jobs: Map<string, ScheduledJob> = new Map();
  private isRunning = false;

  async initialize() {
    if (!dataLoaderConfig.enabled) {
      console.log('Data loader scheduler is disabled');
      return;
    }

    this.isRunning = true;
    console.log('Initializing data loader scheduler');

    this.scheduleJob('daily', dataLoaderConfig.daily, this.runDailyLoad.bind(this));
    this.scheduleJob('weekly', dataLoaderConfig.weekly, this.runWeeklyLoad.bind(this));
    this.scheduleJob('monthly', dataLoaderConfig.monthly, this.runMonthlyLoad.bind(this));

    console.log('Data loader scheduler initialized');
  }

  private scheduleJob(
    name: string,
    cronExpression: string,
    handler: () => Promise<void>,
  ) {
    try {
      const task = cron.schedule(cronExpression, async () => {
        await this.executeJob(name, handler);
      });

      this.jobs.set(name, {
        name,
        task,
        cronExpression,
      });

      console.log(
        `Scheduled ${name} data load: ${cronExpression}`,
      );
    } catch (error) {
      console.error(`Failed to schedule ${name} job`, error);
    }
  }

  private async executeJob(name: string, handler: () => Promise<void>) {
    const job = this.jobs.get(name);
    if (!job) return;

    console.log(`Starting ${name} data load`);

    try {
      await handler();
      job.lastRun = new Date();
      job.lastError = undefined;
      console.log(`${name} data load completed`);
    } catch (error) {
      job.lastError = error as Error;
      console.error(`${name} data load failed`, error);
    }
  }

  // Manual trigger for testing or on-demand runs 
  async trigger(jobName: string) {
    const job = this.jobs.get(jobName);
    if (!job) {
      throw new Error(`Job ${jobName} not found`);
    }

    const handler = this.getJobHandler(jobName);
    await this.executeJob(jobName, handler);
  }

  private getJobHandler(jobName: string): () => Promise<void> {
    switch (jobName) {
      case 'daily':
        return this.runDailyLoad.bind(this);
      case 'weekly':
        return this.runWeeklyLoad.bind(this);
      case 'monthly':
        return this.runMonthlyLoad.bind(this);
      default:
        throw new Error(`Unknown job: ${jobName}`);
    }
  }

  private async runDailyLoad() {
    console.log('Running daily data loads...');
    await downloadAndLoadMR();
  }

  private async runWeeklyLoad() {
    console.log('Running weekly data loads...');
  }

  private async runMonthlyLoad() {
    console.log('Running monthly data loads...');
    await downloadAndLoadDLP();
    await downloadAndLoadREG();
    await downloadAndLoadLEKARNY();
    await downloadAndLoadEPOUKAZ();
    await downloadAndLoadOPVYJIMKY();
    await downloadAndLoadCEDI();
    await downloadAndLoadZPROSTRED();
    await downloadAndLoadLEK13();
    await downloadAndLoadDIS13();
    await downloadAndLoadREG13();
    await downloadAndLoadERECEPT();
    await downloadAndLoadPOVINNOST_DODAVEK();
  }

  getStatus() {
    const jobs = Array.from(this.jobs.values()).map(job => ({
      name: job.name,
      cronExpression: job.cronExpression,
      lastRun: job.lastRun,
      lastError: job.lastError?.message,
    }));

    return {
      running: this.isRunning,
      jobs,
    };
  }

  async shutdown() {
    console.log('Shutting down data loader scheduler');
    this.jobs.forEach(job => {
      if (job.task) {
        job.task.stop();
      }
    });
    this.isRunning = false;
  }
}

export const dataLoaderScheduler = new DataLoaderScheduler();
