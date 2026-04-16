import { dataLoaderScheduler } from '../../services/dataLoaderScheduler.service';
import * as downloadAndLoad from '../../loaders/downloadAndLoad';

jest.mock('../../loaders/downloadAndLoad');

describe('DataLoaderScheduler', () => {
  beforeAll(async () => {
    jest.useFakeTimers();
    await dataLoaderScheduler.initialize();
  });

  afterAll(async () => {
    await dataLoaderScheduler.shutdown();
    jest.useRealTimers();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('trigger', () => {
    it('should trigger daily load manually', async () => {
      (downloadAndLoad.downloadAndLoadMR as jest.Mock).mockResolvedValue(undefined);

      await dataLoaderScheduler.trigger('daily');

      expect(downloadAndLoad.downloadAndLoadMR).toHaveBeenCalled();
      const status = dataLoaderScheduler.getStatus();
      const dailyJob = status.jobs.find(j => j.name === 'daily');
      expect(dailyJob?.lastRun).toBeDefined();
      expect(dailyJob?.lastError).toBeUndefined();
    });

    it('should trigger weekly load manually', async () => {
      await dataLoaderScheduler.trigger('weekly');
      const status = dataLoaderScheduler.getStatus();
      const weeklyJob = status.jobs.find(j => j.name === 'weekly');
      expect(weeklyJob?.lastRun).toBeDefined();
    });

    it('should trigger monthly load manually', async () => {
      (downloadAndLoad.downloadAndLoadDLP as jest.Mock).mockResolvedValue(undefined);
      (downloadAndLoad.downloadAndLoadMR as jest.Mock).mockResolvedValue(undefined);
      (downloadAndLoad.downloadAndLoadREG as jest.Mock).mockResolvedValue(undefined);
      (downloadAndLoad.downloadAndLoadLEKARNY as jest.Mock).mockResolvedValue(undefined);
      (downloadAndLoad.downloadAndLoadEPOUKAZ as jest.Mock).mockResolvedValue(undefined);
      (downloadAndLoad.downloadAndLoadOPVYJIMKY as jest.Mock).mockResolvedValue(undefined);
      (downloadAndLoad.downloadAndLoadCEDI as jest.Mock).mockResolvedValue(undefined);
      (downloadAndLoad.downloadAndLoadLEK13 as jest.Mock).mockResolvedValue(undefined);
      (downloadAndLoad.downloadAndLoadDIS13 as jest.Mock).mockResolvedValue(undefined);
      (downloadAndLoad.downloadAndLoadREG13 as jest.Mock).mockResolvedValue(undefined);
      (downloadAndLoad.downloadAndLoadERECEPT as jest.Mock).mockResolvedValue(undefined);
      (downloadAndLoad.downloadAndLoadPOVINNOST_DODAVEK as jest.Mock).mockResolvedValue(undefined);

      await dataLoaderScheduler.trigger('monthly');

      expect(downloadAndLoad.downloadAndLoadDLP).toHaveBeenCalled();
      expect(downloadAndLoad.downloadAndLoadREG).toHaveBeenCalled();
      expect(downloadAndLoad.downloadAndLoadLEK13).toHaveBeenCalled();

      const status = dataLoaderScheduler.getStatus();
      const monthlyJob = status.jobs.find(j => j.name === 'monthly');
      expect(monthlyJob?.lastRun).toBeDefined();
      expect(monthlyJob?.lastError).toBeUndefined();
    });

    it('should throw error for unknown job', async () => {
      await expect(dataLoaderScheduler.trigger('unknown')).rejects.toThrow(
        'Job unknown not found',
      );
    });

    it('should handle download errors gracefully', async () => {
      const error = new Error('Download failed');
      (downloadAndLoad.downloadAndLoadMR as jest.Mock).mockRejectedValue(error);

      await dataLoaderScheduler.trigger('daily');

      const status = dataLoaderScheduler.getStatus();
      const dailyJob = status.jobs.find(j => j.name === 'daily');
      expect(dailyJob?.lastError).toBeDefined();
      expect(dailyJob?.lastError).toContain('Download failed');
    });
  });

  describe('status', () => {
    it('should return scheduler status', async () => {
      const status = dataLoaderScheduler.getStatus();

      expect(status).toHaveProperty('running');
      expect(status).toHaveProperty('jobs');
      expect(status.jobs.length).toBe(3);

      expect(status.jobs[0]).toHaveProperty('name');
      expect(status.jobs[0]).toHaveProperty('cronExpression');
      expect(status.jobs[0]).toHaveProperty('lastRun');
      expect(status.jobs[0]).toHaveProperty('lastError');
    });

    it('should track lastRun and lastError', async () => {
      (downloadAndLoad.downloadAndLoadMR as jest.Mock).mockResolvedValue(undefined);

      await dataLoaderScheduler.trigger('daily');
      const status1 = dataLoaderScheduler.getStatus();
      const dailyJob1 = status1.jobs.find(j => j.name === 'daily');
      expect(dailyJob1?.lastRun).toBeDefined();

      const error = new Error('Test error');
      (downloadAndLoad.downloadAndLoadMR as jest.Mock).mockRejectedValue(error);

      await dataLoaderScheduler.trigger('daily');
      const status2 = dataLoaderScheduler.getStatus();
      const dailyJob2 = status2.jobs.find(j => j.name === 'daily');
      expect(dailyJob2?.lastError).toBeDefined();
    });
  });
});
