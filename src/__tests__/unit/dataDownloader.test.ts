import { downloadDLP, downloadMR, downloadREG, downloadLEKARNY, downloadEPOUKAZ, downloadOPVYJIMKY, downloadCEDI, downloadZPROSTRED, downloadLEK13, downloadDIS13, downloadREG13, downloadERECEPT, downloadPOVINNOST_DODAVEK } from '../../services/dataDownloader.service';
import { promises as fsPromises } from 'fs';
import path from 'path';

describe.skip('dataDownloader', () => {
  const dataDir = path.join(process.cwd(), 'data');
  const dlpDir = path.join(dataDir, 'dlp-test');
  const mrDir = path.join(dataDir, 'mr-test');
  const regDir = path.join(dataDir, 'reg-test');
  const lekarnyDir = path.join(dataDir, 'lekarny-test');
  const epoukazDir = path.join(dataDir, 'epoukaz-test');
  const opVyjimkyDir = path.join(dataDir, 'op-vyjimky-test');
  const cediDir = path.join(dataDir, 'cedi-test');
  const zprostredDir = path.join(dataDir, 'zprostred-test');
  const lek13Dir = path.join(dataDir, 'lek13-test');
  const dis13Dir = path.join(dataDir, 'dis13-test');
  const reg13Dir = path.join(dataDir, 'reg13-test');
  const ereceptDir = path.join(dataDir, 'erecept-test');
  const povinnostDir = path.join(dataDir, 'povinnost-test');

  beforeAll(async () => {
    await fsPromises.mkdir(dataDir, { recursive: true });
  });

  describe('DLP Download', () => {
    afterAll(async () => {
      await fsPromises.rm(dlpDir, { recursive: true }).catch(() => {});
    });

    it('should successfully download and extract DLP dataset', async () => {
      await downloadDLP(dlpDir);

      await expect(fsPromises.access(dlpDir)).resolves.toBeUndefined();
      const files = await fsPromises.readdir(dlpDir);
      expect(files.length).toBeGreaterThan(0);
      const expectedFiles = ['dlp_atc.csv', 'dlp_organizace.csv', 'dlp_formy.csv'];
      const missingFiles = expectedFiles.filter((file) => !files.includes(file));
      expect(missingFiles).toEqual([]);
    }, 600000);
  });

  describe('MR Download', () => {
    afterAll(async () => {
      await fsPromises.rm(mrDir, { recursive: true }).catch(() => {});
    });

    it('should successfully download and extract MR dataset', async () => {
      await downloadMR(mrDir);

      await expect(fsPromises.access(mrDir)).resolves.toBeUndefined();
      const files = await fsPromises.readdir(mrDir);
      expect(files.length).toBeGreaterThan(0);
      const expectedFiles = ['mr_hlaseni.csv', 'mr_hlaseni_platnost.csv'];
      const missingFiles = expectedFiles.filter((file) => !files.includes(file));
      expect(missingFiles).toEqual([]);
    }, 600000);
  });

  describe('REG Download', () => {
    afterAll(async () => {
      await fsPromises.rm(regDir, { recursive: true }).catch(() => {});
    });

    it('should successfully download and extract REG dataset', async () => {
      await downloadREG(regDir);

      await expect(fsPromises.access(regDir)).resolves.toBeUndefined();
      const files = await fsPromises.readdir(regDir);
      expect(files.length).toBeGreaterThan(0);
      const expectedFiles = [
        'reg_lp_zrusene.csv',
        'reg_neplatne.csv',
        'reg_nove.csv',
        'reg_platnost.csv',
        'reg_zrusene.csv',
      ];
      const missingFiles = expectedFiles.filter((file) => !files.includes(file));
      expect(missingFiles).toEqual([]);
    }, 600000);
  });

  describe('LEKARNY Download', () => {
    afterAll(async () => {
      await fsPromises.rm(lekarnyDir, { recursive: true }).catch(() => {});
    });

    it('should successfully download and extract LEKARNY dataset', async () => {
      await downloadLEKARNY(lekarnyDir);

      await expect(fsPromises.access(lekarnyDir)).resolves.toBeUndefined();
      const files = await fsPromises.readdir(lekarnyDir);
      expect(files.length).toBeGreaterThan(0);
      const expectedFiles = ['lekarny_seznam.csv', 'lekarny_typ.csv'];
      const missingFiles = expectedFiles.filter((file) => !files.includes(file));
      expect(missingFiles).toEqual([]);
    }, 600000);
  });

  describe('EPOUKAZ Download', () => {
    afterAll(async () => {
      await fsPromises.rm(epoukazDir, { recursive: true }).catch(() => {});
    });

    it('should successfully download and extract EPOUKAZ dataset', async () => {
      await downloadEPOUKAZ(epoukazDir);

      await expect(fsPromises.access(epoukazDir)).resolves.toBeUndefined();
      const files = await fsPromises.readdir(epoukazDir);
      expect(files.length).toBeGreaterThan(0);
      expect(files.length).toBeGreaterThan(5); // EPOUKAZ má 20+ souborů
    }, 600000);
  });

  describe('OP_VYJIMKY Download', () => {
    afterAll(async () => {
      await fsPromises.rm(opVyjimkyDir, { recursive: true }).catch(() => {});
    });

    it('should successfully download and extract OP_VYJIMKY dataset', async () => {
      await downloadOPVYJIMKY(opVyjimkyDir);

      await expect(fsPromises.access(opVyjimkyDir)).resolves.toBeUndefined();
      const files = await fsPromises.readdir(opVyjimkyDir);
      expect(files.length).toBeGreaterThan(0);
      const expectedFiles = ['ochranne_prvky_ano.csv', 'ochranne_prvky_ne.csv'];
      const missingFiles = expectedFiles.filter((file) => !files.includes(file));
      expect(missingFiles).toEqual([]);
    }, 600000);
  });

  describe('CEDI Download', () => {
    afterAll(async () => {
      await fsPromises.rm(cediDir, { recursive: true }).catch(() => {});
    });

    it('should successfully download and extract CEDI dataset', async () => {
      await downloadCEDI(cediDir);

      await expect(fsPromises.access(cediDir)).resolves.toBeUndefined();
      const files = await fsPromises.readdir(cediDir);
      expect(files.length).toBeGreaterThan(0);
      expect(files.some((f) => f.includes('cedi'))).toBe(true);
    }, 600000);
  });

  describe('ZPROSTRED Download', () => {
    afterAll(async () => {
      await fsPromises.rm(zprostredDir, { recursive: true }).catch(() => {});
    });

    it('should successfully download and extract ZPROSTRED dataset', async () => {
      await downloadZPROSTRED(zprostredDir);

      await expect(fsPromises.access(zprostredDir)).resolves.toBeUndefined();
      const files = await fsPromises.readdir(zprostredDir);
      expect(files.length).toBeGreaterThan(0);
      expect(files.some((f) => f.includes('zprostredkovatele') || f.includes('zprostred'))).toBe(
        true,
      );
    }, 600000);
  });

  describe('LEK13 Download', () => {
    afterAll(async () => {
      await fsPromises.rm(lek13Dir, { recursive: true }).catch(() => {});
    });

    it('should successfully download all LEK13 CSV files', async () => {
      await downloadLEK13(lek13Dir);

      await expect(fsPromises.access(lek13Dir)).resolves.toBeUndefined();
      const files = await fsPromises.readdir(lek13Dir);
      expect(files.length).toBeGreaterThan(0);
      expect(files.every((f) => f.endsWith('.csv'))).toBe(true);
    }, 600000);
  });

  describe('DIS13 Download', () => {
    afterAll(async () => {
      await fsPromises.rm(dis13Dir, { recursive: true }).catch(() => {});
    });

    it('should successfully download all DIS13 CSV files', async () => {
      await downloadDIS13(dis13Dir);

      await expect(fsPromises.access(dis13Dir)).resolves.toBeUndefined();
      const files = await fsPromises.readdir(dis13Dir);
      expect(files.length).toBeGreaterThan(0);
      expect(files.every((f) => f.endsWith('.csv'))).toBe(true);
    }, 600000);
  });

  describe('REG13 Download', () => {
    afterAll(async () => {
      await fsPromises.rm(reg13Dir, { recursive: true }).catch(() => {});
    });

    it('should successfully download all REG13 CSV files', async () => {
      await downloadREG13(reg13Dir);

      await expect(fsPromises.access(reg13Dir)).resolves.toBeUndefined();
      const files = await fsPromises.readdir(reg13Dir);
      expect(files.length).toBeGreaterThan(0);
      expect(files.every((f) => f.endsWith('.csv'))).toBe(true);
    }, 600000);
  });

  describe('ERECEPT Download', () => {
    afterAll(async () => {
      await fsPromises.rm(ereceptDir, { recursive: true }).catch(() => {});
    });

    it('should successfully download all ERECEPT ZIP files', async () => {
      await downloadERECEPT(ereceptDir);

      await expect(fsPromises.access(ereceptDir)).resolves.toBeUndefined();
      const files = await fsPromises.readdir(ereceptDir);
      expect(files.length).toBeGreaterThan(0);
      expect(files.some((f) => f.includes('erecept'))).toBe(true);
    }, 600000);
  });

  describe('POVINNOST_DODAVEK Download', () => {
    afterAll(async () => {
      await fsPromises.rm(povinnostDir, { recursive: true }).catch(() => {});
    });

    it('should successfully download all POVINNOST_DODAVEK CSV files from 202501', async () => {
      await downloadPOVINNOST_DODAVEK(povinnostDir);

      await expect(fsPromises.access(povinnostDir)).resolves.toBeUndefined();
      const files = await fsPromises.readdir(povinnostDir);
      expect(files.length).toBeGreaterThan(0);
      expect(files.every((f) => f.endsWith('.csv'))).toBe(true);
      // Verify all files are from 202501 onwards
      const allMatch202501OrLater = files.every((f) => {
        const match = f.match(/povinnost_dodavek_po_preruseni_(\d{6})\.csv/);
        return match && parseInt(match[1]) >= 202501;
      });
      expect(allMatch202501OrLater).toBe(true);
    }, 600000);
  });
});
