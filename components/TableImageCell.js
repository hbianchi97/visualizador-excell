'use client';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import styles from './TableImageCell.module.css';

export default function TableImageCell({ link }) {
    const [images, setImages] = useState([]);
    const [current, setCurrent] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (link) {
            setLoading(true);
            fetch(`/api/preview?url=${encodeURIComponent(link)}`)
                .then(res => res.json())
                .then(data => {
                    if (data.images && data.images.length > 0) {
                        setImages(data.images);
                    }
                })
                .catch(err => console.error("Failed to fetch preview"))
                .finally(() => setLoading(false));
        }
    }, [link]);

    const next = (e) => {
        e.stopPropagation();
        e.preventDefault();
        setCurrent((p) => (p + 1) % images.length);
    };

    const prev = (e) => {
        e.stopPropagation();
        e.preventDefault();
        setCurrent((p) => (p - 1 + images.length) % images.length);
    };

    if (loading) return <div className={styles.loading}><div className={styles.spinner} /></div>;
    if (images.length === 0) return <div className={styles.noImage}><ImageIcon size={16} /></div>;

    return (
        <div className={styles.cell}>
            <div className={styles.imageWrapper}>
                <img src={images[current]} alt="Preview" className={styles.img} />

                {images.length > 1 && (
                    <div className={styles.controls}>
                        <button onClick={prev} className={styles.btn}><ChevronLeft size={12} /></button>
                        <span className={styles.badge}>{current + 1}/{images.length}</span>
                        <button onClick={next} className={styles.btn}><ChevronRight size={12} /></button>
                    </div>
                )}
            </div>
        </div>
    );
}
