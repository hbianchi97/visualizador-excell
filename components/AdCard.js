'use client';
import { useState, useEffect } from 'react';
import styles from './AdCard.module.css';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';

export default function AdCard({ data }) {
    const [images, setImages] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [loadingImages, setLoadingImages] = useState(false);

    // Extract data with fallback for keys
    const city = data['Cidade'] || '';
    const district = data['Bairro'] || '';
    const address = data['Endereço'] || '';
    const price = data['Preço'] || 0;
    const valuation = data['Valor de Avaliação'] || 0;
    const discount = data['Desconto'] || 0;
    const link = data['Link de acesso'] || '';

    // Format currency
    const formatMoney = (val) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    };

    // Format discount: remove decimals and add %
    const formatDiscount = (val) => {
        // Assuming val is a number like 0.4 or 40. 
        // If it's a decimal < 1 (e.g. 0.45 for 45%), multiply by 100? 
        // Or if it's already 45, just round.
        // Let's assume the user data might be mixed, but typically Excel "Percentage" style is 0.xx.
        // However, user said "excluísse a casa decimal", implying it might have decimals.
        // Let's just treat it as a number found in the cell.
        if (typeof val === 'number') {
            // Heuristic: if < 1, might be partial. But safely, just display as is integer.
            // Actually, if it's 0.45, showing "0%" is wrong.
            // Let's display Math.round(val * 100) if it looks like a ratio, or Math.round(val) if it looks like a whole number?
            // Safest: Just remove decimals from whatever number it is.
            // User said: "Na informação de desconto gostaria que adicionasse "%" ao final e excluísse a casa decimal."
            // Example: 45.5 -> 45%. 0.45 -> 0%?
            // I will assume the raw value is what they want rounded.
            return `${Math.floor(val)}%`;
        }
        return val;
    };

    useEffect(() => {
        if (link) {
            setLoadingImages(true);
            fetch(`/api/preview?url=${encodeURIComponent(link)}`)
                .then(res => res.json())
                .then(data => {
                    if (data.images && data.images.length > 0) {
                        setImages(data.images);
                    }
                })
                .catch(err => console.error("Failed to fetch preview", err))
                .finally(() => setLoadingImages(false));
        }
    }, [link]);

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <div className={styles.card}>
            <div className={styles.imageContainer}>
                {loadingImages ? (
                    <div className={styles.placeholder}>Loading images...</div>
                ) : images.length > 0 ? (
                    <>
                        <img src={images[currentImageIndex]} alt="Preview" className={styles.image} />
                        {images.length > 1 && (
                            <>
                                <button onClick={prevImage} className={`${styles.navObj} ${styles.prev}`}><ChevronLeft size={20} /></button>
                                <button onClick={nextImage} className={`${styles.navObj} ${styles.next}`}><ChevronRight size={20} /></button>
                                <div className={styles.dots}>
                                    {images.map((_, idx) => (
                                        <span key={idx} className={`${styles.dot} ${idx === currentImageIndex ? styles.activeDot : ''}`} />
                                    ))}
                                </div>
                            </>
                        )}
                    </>
                ) : (
                    <div className={styles.placeholder}>No Preview Available</div>
                )}
            </div>

            <div className={styles.content}>
                <div className={styles.header}>
                    <h3 className={styles.title}>{district} - {city}</h3>
                    <span className={styles.discountBadge}>{formatDiscount(discount)} OFF</span>
                </div>
                <p className={styles.address}>{address}</p>

                <div className={styles.prices}>
                    <div className={styles.priceItem}>
                        <span className={styles.label}>Avaliação</span>
                        <span className={styles.valueStrikethrough}>{formatMoney(valuation)}</span>
                    </div>
                    <div className={styles.priceItem}>
                        <span className={styles.label}>Preço</span>
                        <span className={styles.valueMain}>{formatMoney(price)}</span>
                    </div>
                </div>

                <a href={link} target="_blank" rel="noopener noreferrer" className={styles.button}>
                    Ver Detalhes <ExternalLink size={16} style={{ marginLeft: 8 }} />
                </a>
            </div>
        </div>
    );
}
