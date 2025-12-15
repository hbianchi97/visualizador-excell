import * as XLSX from 'xlsx';

export const parseExcel = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        // Read with header: 'A' produces keys like 'A', 'B', 'C'...
        // raw: false forces reading the displayed string (e.g. "1.000,00") rather than raw number 1000
        const json = XLSX.utils.sheet_to_json(sheet, { header: 'A', raw: false });
        resolve(json);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};
