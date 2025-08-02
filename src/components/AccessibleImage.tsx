import React, { useState } from 'react';

interface AccessibleImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
  fallbackSrc?: string;
}

const AccessibleImage: React.FC<AccessibleImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  loading = 'lazy',
  onLoad,
  onError,
  fallbackSrc,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setIsLoading(true);
    } else {
      onError?.();
    }
  };

  if (hasError && !fallbackSrc) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 ${className}`}
        style={{ width, height }}
        role="img"
        aria-label={`Image non disponible : ${alt}`}
      >
        <span className="text-sm">Image non disponible</span>
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div 
          className={`flex items-center justify-center bg-gray-100 dark:bg-gray-700 ${className}`}
          style={{ width, height }}
          aria-hidden="true"
        >
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      )}
      <img
        src={currentSrc}
        alt={alt}
        className={`${className} ${isLoading ? 'hidden' : ''}`}
        width={width}
        height={height}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        style={{ display: isLoading ? 'none' : 'block' }}
      />
    </div>
  );
};

export default AccessibleImage; 