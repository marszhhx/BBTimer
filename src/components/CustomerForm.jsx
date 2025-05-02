import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Fade,
  useTheme,
  useMediaQuery,
} from '@mui/material';

function CustomerForm({ open, onClose, onSubmit, initialName = '' }) {
  const [name, setName] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (initialName) {
      setName(initialName);
    }
  }, [initialName]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim());
      setName('');
    }
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
          borderBottom: '1px solid #e0e0e0',
        }}>
        Register New Customer
      </DialogTitle>
      <DialogContent>
        <Box component='form' onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            autoFocus
            fullWidth
            label='Customer Name'
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 0,
              },
            }}
          />
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
          Cancel
        </Button>
        <Button
          variant='contained'
          onClick={handleSubmit}
          disabled={!name.trim()}
          sx={{
            backgroundColor: 'black',
            '&:hover': {
              backgroundColor: '#333',
            },
            '&:disabled': {
              backgroundColor: '#e0e0e0',
            },
            transition: 'all 0.2s ease-in-out',
            '&:active': {
              transform: 'scale(0.98)',
            },
          }}>
          Register
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CustomerForm;
