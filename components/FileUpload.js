'use client';
import { useState } from 'react';
import { parseExcel } from '@/utils/excelParser';
import styles from './FileUpload.module.css';

export default function FileUpload({ onDataLoaded }) {
    const [loading, setLoading] = useState(false);

    const handleFile = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setLoading(true);
        try {
            const data = await parseExcel(file);
            console.log("Parsed Data:", data); // Debugging

            // Mapping definitions based on user input
            // C: Cidade, D: Bairro, E: Endereço, F: Preço, G: Avaliação, H: Desconto, K: Link
            const mappedData = data.map(row => ({
                'Cidade': row['C'],
                'Bairro': row['D'],
                'Endereço': row['E'],
                'Preço': row['F'],
                'Valor de Avaliação': row['G'],
                'Desconto': row['H'],
                'Link de acesso': row['K']
            })).filter(row => {
                // Filter out empty rows or header rows
                // If "Preço" contains the word "Preço", it's a header row
                if (row['Preço'] && row['Preço'].toString().includes('Preço')) return false;
                // Filter out metadata rows (Line 1 usually has empty fields or just title)
                if (!row['Preço']) return false; 
                // If critical fields are missing, skip
                if (!row['Link de acesso']) return false;
                return true;
            });

            console.log("Mapped Data:", mappedData);
            onDataLoaded(mappedData);
        } catch (err) {
            console.error(err);
            alert('Error parsing file');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <label className={styles.label}>
                <span>Upload Excel File</span>
                <input
                    type="file"
                    onChange={handleFile}
                    className={styles.input}
                />
            </label>
            {loading && <p className={styles.loading}>Processing...</p>}
        </div>
    );
}
