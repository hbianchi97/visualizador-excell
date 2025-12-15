'use client';
import { useState, useEffect, useRef } from 'react';
import styles from './DualRangeSlider.module.css';

export default function DualRangeSlider({ min, max, onChange, formatLabel }) {
    const [minVal, setMinVal] = useState(min);
    const [maxVal, setMaxVal] = useState(max);
    const range = useRef(null);

    // Convert to specific percentage for styling
    const getPercent = (value) => Math.round(((value - min) / (max - min)) * 100);

    // Sync state with props if they change externally (e.g. new file loaded)
    useEffect(() => {
        setMinVal(min);
        setMaxVal(max);
    }, [min, max]);

    useEffect(() => {
        if (range.current) {
            const minPercent = getPercent(minVal);
            const maxPercent = getPercent(maxVal);

            if (range.current) {
                range.current.style.left = `${minPercent}%`;
                range.current.style.width = `${maxPercent - minPercent}%`;
            }
        }
    }, [minVal, maxVal, min, max]);

    return (
        <div className={styles.container}>
            {/* Slider Inputs */}
            <input
                type="range"
                min={min}
                max={max}
                value={minVal}
                onChange={(event) => {
                    const value = Math.min(Number(event.target.value), maxVal - 1);
                    setMinVal(value);
                    onChange(value, maxVal);
                }}
                className={`${styles.thumb} ${styles.thumbLeft}`}
                style={{ zIndex: minVal > max - 100 && "5" }}
            />
            <input
                type="range"
                min={min}
                max={max}
                value={maxVal}
                onChange={(event) => {
                    const value = Math.max(Number(event.target.value), minVal + 1);
                    setMaxVal(value);
                    onChange(minVal, value);
                }}
                className={`${styles.thumb} ${styles.thumbRight}`}
            />

            {/* Visual Track */}
            <div className={styles.slider}>
                <div className={styles.slider__track} />
                <div ref={range} className={styles.slider__range} />
            </div>

            {/* Labels */}
            <div className={styles.values}>
                <div className={styles.val}>{formatLabel ? formatLabel(minVal) : minVal}</div>
                <div className={styles.val}>{formatLabel ? formatLabel(maxVal) : maxVal}</div>
            </div>
        </div>
    );
}
