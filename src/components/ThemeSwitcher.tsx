import React from 'react';
import { Switch, Box } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useTheme } from '../context/ThemeContext';

const ThemeSwitcher: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Brightness7 sx={{ mr: 1, color: isDarkMode ? 'grey.500' : 'primary.main' }} />
      <Switch
        checked={isDarkMode}
        onChange={toggleTheme}
        color="primary"
      />
      <Brightness4 sx={{ ml: 1, color: isDarkMode ? 'primary.main' : 'grey.500' }} />
    </Box>
  );
};

export default ThemeSwitcher; 