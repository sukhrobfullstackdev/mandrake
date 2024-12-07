import { Box } from '@styled/jsx';
import React from 'react';

interface MenuOverlayProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

const MenuOverlay: React.FC<MenuOverlayProps> = ({ children, isOpen, onClose }) => {
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <Box
      position={'fixed'}
      top={0}
      left={0}
      right={0}
      bottom={0}
      zIndex={1}
      display={'flex'}
      justifyContent={'flex-end'}
      backgroundColor={'rgba(0, 0, 0, 0.7)'}
      opacity={isOpen ? 1 : 0}
      visibility={isOpen ? 'visible' : 'hidden'}
      transition={'opacity 0.1s ease-in-out, visibility 0.1s ease-in-out'}
      backdropFilter={'blur(0.1rem)'}
      onClick={handleOverlayClick}
    >
      {children}
    </Box>
  );
};

export default MenuOverlay;
