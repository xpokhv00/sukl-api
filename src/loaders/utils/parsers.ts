export const Parsers = {
  string: (v?: string) => (v?.trim() ? v.trim() : ""),

  optionalString: (v?: string) => {
    const val = v?.trim();
    return val ? val : null;
  },

  boolean: (v?: string) => {
    if (!v) return false;
    const val = v.trim().toLowerCase();
    return ["1", "true", "yes", "y", "ano"].includes(val);
  },

  number: (v?: string) => {
    if (!v) return null;
    const normalized = v.replace(",", ".").trim();
    const n = Number(normalized);
    return Number.isNaN(n) ? null : n;
  },

  date: (v?: string) => {
    if (!v) return null;
    const val = v.trim();
    const parts = val.split(".");
    if (parts.length === 3) {
      const [day, month, year] = parts;
      const d = new Date(`${year}-${month}-${day}`);
      return Number.isNaN(d.getTime()) ? null : d;
    }
    const d = new Date(val);
    return Number.isNaN(d.getTime()) ? null : d;
  },
};