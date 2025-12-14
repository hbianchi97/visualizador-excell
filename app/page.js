'use client';
import { useState } from 'react';
import styles from './page.module.css';
import FileUpload from '@/components/FileUpload';
import AdCard from '@/components/AdCard';
import { LayoutGrid, List } from 'lucide-react';

export default function Home() {
  const [data, setData] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  const handleDataLoaded = (parsedData) => {
    setData(parsedData);
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.logo}>Excel<span style={{ color: '#0070f3' }}>Visualizer</span></h1>
        {data.length > 0 && (
          <div className={styles.controls}>
            <button
              onClick={() => setViewMode('grid')}
              className={`${styles.iconBtn} ${viewMode === 'grid' ? styles.active : ''}`}
            >
              <LayoutGrid size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`${styles.iconBtn} ${viewMode === 'list' ? styles.active : ''}`}
            >
              <List size={20} />
            </button>
          </div>
        )}
      </header>

      <main className={styles.main}>
        {data.length === 0 ? (
          <div className={styles.uploadSection}>
            <h2 className={styles.heroTitle}>Visualize your Real Estate Ads</h2>
            <p className={styles.heroText}>Upload your spreadsheet to get started.</p>
            <FileUpload onDataLoaded={handleDataLoaded} />
          </div>
        ) : (
          <div className={viewMode === 'grid' ? styles.grid : styles.list}>
            {data.map((row, index) => (
              <AdCard key={index} data={row} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
