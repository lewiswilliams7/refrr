import React from 'react';
import { Avatar as MuiAvatar } from '@mui/material';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  firstName?: string;
  lastName?: string;
  sx?: any;
}

const Avatar: React.FC<AvatarProps> = ({ 
  src, 
  alt = 'User avatar', 
  size = 'medium', 
  className,
  firstName,
  lastName,
  sx = {}
}) => {
  const [error, setError] = React.useState(false);
  const [fallbackError, setFallbackError] = React.useState(false);

  const handleError = () => {
    setError(true);
  };

  const handleFallbackError = () => {
    setFallbackError(true);
  };

  const getSize = () => {
    switch (size) {
      case 'small':
        return 32;
      case 'large':
        return 64;
      default:
        return 48;
    }
  };

  const getInitials = () => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`;
    }
    return 'U';
  };

  const getFallbackAvatar = () => {
    if (firstName && lastName) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName + ' ' + lastName)}&background=random&size=200&bold=true&format=svg`;
    }
    return null;
  };

  // Check if the URL is from the problematic S3 bucket
  const isS3Url = src?.includes('render-prod-avatars.s3.us-west-2.amazonaws.com');
  
  // If it's an S3 URL or there's an error, try the fallback avatar
  if (error || !src || isS3Url) {
    const fallbackSrc = getFallbackAvatar();
    if (fallbackSrc && !fallbackError) {
      return (
        <MuiAvatar
          src={fallbackSrc}
          alt={alt}
          sx={{
            width: getSize(),
            height: getSize(),
            ...sx
          }}
          className={className}
          onError={handleFallbackError}
        />
      );
    }
    
    // If fallback also fails, show initials
    return (
      <MuiAvatar
        sx={{
          width: getSize(),
          height: getSize(),
          bgcolor: 'primary.main',
          color: 'white',
          fontWeight: 'bold',
          ...sx
        }}
        className={className}
      >
        {getInitials()}
      </MuiAvatar>
    );
  }

  return (
    <MuiAvatar
      src={src}
      alt={alt}
      sx={{
        width: getSize(),
        height: getSize(),
        ...sx
      }}
      className={className}
      onError={handleError}
    />
  );
};

export default Avatar; 