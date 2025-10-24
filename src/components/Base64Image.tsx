import React, { useState } from 'react';

interface Base64ImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  onLoad?: () => void;
  onError?: () => void;
}

const Base64Image: React.FC<Base64ImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  onLoad,
  onError,
}) => {
  const [hasError, setHasError] = useState(false);

  // Vérifier si c'est une image base64 (s'assurer que src est une string)
  const isBase64 = src && typeof src === 'string' && src.startsWith('data:image/');

  const handleLoad = () => {
    setHasError(false);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Si ce n'est pas une image base64 ou qu'il y a une erreur, ne pas afficher
  if (!isBase64 || hasError) {
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
    <img
      src={src}
      alt={alt}
      className={className}
      width={width}
      height={height}
      onLoad={handleLoad}
      onError={handleError}
    />
  );
};

export default Base64Image;

