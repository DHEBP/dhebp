import React, { useState } from 'react';
import Image from 'next/image';
import styles from './styles.module.css';

export function ZoomableImage({ src, alt, width = 800, height = 500 }) {
  const [isZoomed, setIsZoomed] = useState(false);

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  return (
    <div className={styles.container}>
      <div className={styles.imageWrapper} onClick={toggleZoom}>
        <Image 
          src={src} 
          alt={alt} 
          width={width} 
          height={height}
          className={styles.image} 
        />
        <div className={styles.zoomHint}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            <line x1="11" y1="8" x2="11" y2="14"></line>
            <line x1="8" y1="11" x2="14" y2="11"></line>
          </svg>
        </div>
      </div>

      {isZoomed && (
        <div className={styles.modal} onClick={toggleZoom}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={toggleZoom}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <img 
              src={src} 
              alt={alt} 
              className={styles.zoomedImage} 
            />
          </div>
        </div>
      )}
    </div>
  );
} 