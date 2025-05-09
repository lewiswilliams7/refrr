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
      const name = encodeURIComponent(`${firstName} ${lastName}`.trim());
      return `https://ui-avatars.com/api/?name=${name}&background=random&size=200&bold=true&format=svg`;
    }
    return null;
  };

  // If there's no src, error, or fallback error, show initials
  if (!src || error || fallbackError) {
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

  // Try to load the provided avatar URL
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