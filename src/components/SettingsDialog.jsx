import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  useTheme,
  useMediaQuery,
  Tooltip,
} from '@mui/material';
import { useState, useEffect } from 'react';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

function SettingsDialog({ open, onClose, maxStayTime, onMaxStayTimeChange }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Use local state to handle the input value
  const [inputValue, setInputValue] = useState('');

  // Update local state when maxStayTime changes
  useEffect(() => {
    setInputValue(Math.floor(maxStayTime / 60).toString());
  }, [maxStayTime]);

  const handleInputChange = (event) => {
    const value = event.target.value;

    // Allow empty input
    if (value === '') {
      setInputValue('');
      return;
    }

    // Only allow digits
    if (/^\d*$/.test(value)) {
      setInputValue(value);
    }
  };

  const handleBlur = () => {
    // Convert to number and update parent component
    const minutes = parseInt(inputValue) || 0;
    onMaxStayTimeChange(minutes * 60);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='sm'
      fullWidth
      fullScreen={isMobile}>
      <DialogTitle
        sx={{
          pb: 2,
          borderBottom: '1px solid #e0e0e0',
        }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SettingsIcon />
          <Typography variant='h6'>SETTINGS</Typography>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ mb: 3, mt: 2, borderBottom: 'none', borderTop: 'none' }}>
          <Typography
            variant='subtitle1'
            sx={{ mb: 1, fontWeight: 500, mt: 1.5 }}>
            Maximum Stay Time
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TextField
              fullWidth
              label='Minutes'
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleBlur}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 0,
                },
              }}
            />
            <Tooltip title='Set the maximum duration (in minutes) a customer can stay before being marked as overtime.'>
              <HelpOutlineIcon
                sx={{ color: 'text.secondary', cursor: 'help' }}
              />
            </Tooltip>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions
        sx={{
          px: 3,
          py: 2,
          borderTop: '1px solid #e0e0e0',
        }}>
        <Button
          onClick={onClose}
          sx={{
            color: theme.palette.text.primary,
            '&:hover': {
              backgroundColor: 'transparent',
              color: theme.palette.text.secondary,
            },
          }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default SettingsDialog;
