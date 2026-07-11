import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IconButton, Menu, MenuItem, Typography, Box } from '@mui/material';
import { Language as LanguageIcon } from '@mui/icons-material';
import api from '../services/api';

const languages = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
  { code: 'te', label: 'తెలుగు', flag: '🇮🇳' },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);

  const currentLang = languages.find((l) => l.code === i18n.language) || languages[0];

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleChange = async (langCode) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('i18nextLng', langCode);
    handleClose();

    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        await api.put('/users/me/language', { preferredLanguage: langCode });
      } catch {
        // silently fail — preference is still stored locally
      }
    }
  };

  return (
    <>
      <IconButton onClick={handleOpen} size="small" sx={{ color: 'text.primary' }}>
        <LanguageIcon />
        <Typography variant="body2" sx={{ ml: 0.5, fontWeight: 600, color: 'text.primary' }}>
          {currentLang.code.toUpperCase()}
        </Typography>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{ sx: { mt: 1, minWidth: 160 } }}
      >
        {languages.map((lang) => (
          <MenuItem
            key={lang.code}
            onClick={() => handleChange(lang.code)}
            selected={i18n.language === lang.code}
            sx={{ gap: 1 }}
          >
            <Box component="span" sx={{ fontSize: 18 }}>
              {lang.flag}
            </Box>
            <Typography variant="body2" fontWeight={600}>
              {lang.label}
            </Typography>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
