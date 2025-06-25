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
} from '@mui/material';
import { useState, useEffect } from 'react';

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
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: 0,
          border: '1px solid #e0e0e0',
        },
      }}>
      <DialogTitle
        sx={{
          pb: 2,
          borderBottom: 'none',
        }}>
        Settings
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ mb: 3, mt: 2, borderBottom: 'none', borderTop: 'none' }}>
          <Typography
            variant='subtitle1'
            sx={{ mb: 1, fontWeight: 500, mt: 1.5 }}>
            Maximum Stay Time
          </Typography>
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
          <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
            Set the maximum duration (in minutes) a customer can stay before
            being marked as overtime.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions
        sx={{
          px: 3,
          py: 2,
          borderTop: 'none',
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
