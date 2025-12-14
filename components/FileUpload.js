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
            onDataLoaded(data);
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
                    accept=".xlsx, .xls"
                    onChange={handleFile}
                    className={styles.input}
                />
            </label>
            {loading && <p className={styles.loading}>Processing...</p>}
        </div>
    );
}
