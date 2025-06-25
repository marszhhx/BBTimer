import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  addCustomerAndCheckIn,
  addCheckIn,
  isCustomerCheckedIn,
} from '../services/firebaseService';

function CheckInPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationData, setConfirmationData] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Load saved user information on component mount
  useEffect(() => {
    const savedUserInfo = localStorage.getItem('bbtimer_user_info');
    if (savedUserInfo) {
      try {
        const userInfo = JSON.parse(savedUserInfo);
        setFirstName(userInfo.firstName || '');
        setLastName(userInfo.lastName || '');
        setEmail(userInfo.email || '');
      } catch (error) {
        console.error('Error loading saved user info:', error);
      }
    }
  }, []);

  // Save user information to localStorage
  const saveUserInfo = (firstName, lastName, email) => {
    const userInfo = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
    };
    localStorage.setItem('bbtimer_user_info', JSON.stringify(userInfo));
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setMessage('Please fill in all fields');
      setMessageType('error');
      return;
    }

    if (!validateEmail(email)) {
      setMessage('Please enter a valid email address');
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const result = await addCustomerAndCheckIn(
        firstName.trim(),
        lastName.trim(),
        email.trim().toLowerCase()
      );

      if (result.success) {
        if (result.isNew) {
          setMessage(
            `Welcome ${result.customer.name}! You have been successfully checked in.`
          );
        } else {
          setMessage(
            `Welcome back ${result.customer.name}! You have been successfully checked in.`
          );
        }
        setMessageType('success');

        // Save user information to localStorage
        saveUserInfo(firstName, lastName, email);

        // Clear form
        setFirstName('');
        setLastName('');
        setEmail('');
      } else if (result.needsConfirmation) {
        // Show confirmation dialog
        setConfirmationData(result);
        setShowConfirmation(true);
      } else if (result.alreadyCheckedIn) {
        // User is already checked in
        setMessage(
          `Check-in issue detected. Please contact a floor lead for assistance.`
        );
        setMessageType('error');

        // Clear form
        setFirstName('');
        setLastName('');
        setEmail('');
      }
    } catch (error) {
      console.error('Check-in error:', error);
      setMessage('An error occurred during check-in. Please try again.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmCheckIn = async () => {
    if (!confirmationData) return;

    setIsLoading(true);
    setMessage('');

    try {
      // Check if already checked in before confirming
      const isAlreadyCheckedIn = await isCustomerCheckedIn(
        confirmationData.existingCustomer.id
      );

      if (isAlreadyCheckedIn) {
        setMessage(
          `Check-in Failed. Please reach out to the Floor Lead for assistance.`
        );
        setMessageType('error');

        // Clear form and close dialog
        setFirstName('');
        setLastName('');
        setEmail('');
        setShowConfirmation(false);
        setConfirmationData(null);
        return;
      }

      await addCheckIn(confirmationData.existingCustomer.id);
      setMessage(
        `Welcome back ${confirmationData.existingCustomer.name}! You have been successfully checked in.`
      );
      setMessageType('success');

      // Save user information to localStorage
      saveUserInfo(firstName, lastName, email);

      // Clear form and close dialog
      setFirstName('');
      setLastName('');
      setEmail('');
      setShowConfirmation(false);
      setConfirmationData(null);
    } catch (error) {
      console.error('Check-in error:', error);
      setMessage('An error occurred during check-in. Please try again.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
    setConfirmationData(null);
    setMessage('Please check your information and try again.');
    setMessageType('error');
  };

  return (
    <Container maxWidth='sm' sx={{ py: 4 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: '100vh',
          pt: 4,
        }}>
        <Paper
          elevation={0}
          sx={{
            p: isMobile ? 3 : 4,
            width: '100%',
            border: '1px solid #e0e0e0',
            borderRadius: 0,
          }}>
          <Typography
            variant='h4'
            component='h1'
            gutterBottom
            sx={{
              textAlign: 'center',
              fontWeight: 700,
              mb: 3,
            }}>
            Welcome to Check-in
          </Typography>

          <Typography
            variant='body1'
            sx={{
              textAlign: 'center',
              color: 'text.secondary',
              mb: 4,
            }}>
            Please enter your information to check in
          </Typography>

          {message && (
            <Alert severity={messageType} sx={{ mb: 3, borderRadius: 0 }}>
              {message}
            </Alert>
          )}

          <Box component='form' onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label='First Name'
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              margin='normal'
              required
              disabled={isLoading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 0,
                },
              }}
            />

            <TextField
              fullWidth
              label='Last Name'
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              margin='normal'
              required
              disabled={isLoading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 0,
                },
              }}
            />

            <TextField
              fullWidth
              label='Email Address'
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin='normal'
              required
              disabled={isLoading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 0,
                },
              }}
            />

            <Button
              type='submit'
              fullWidth
              variant='contained'
              disabled={
                isLoading ||
                !firstName.trim() ||
                !lastName.trim() ||
                !email.trim()
              }
              sx={{
                mt: 4,
                py: 1.5,
                backgroundColor: 'black',
                borderRadius: 0,
                textTransform: 'none',
                fontSize: '1.1rem',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: '#333',
                },
                '&:disabled': {
                  backgroundColor: '#e0e0e0',
                },
              }}>
              {isLoading ? (
                <CircularProgress size={24} sx={{ color: 'white' }} />
              ) : (
                'Complete Check-in'
              )}
            </Button>
          </Box>
        </Paper>
      </Box>

      {/* Confirmation Dialog */}
      <Dialog
        open={showConfirmation}
        onClose={handleCancelConfirmation}
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
          Account Found
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant='body1' sx={{ mb: 2 }}>
            An account with this email address already exists:
          </Typography>
          <Box
            sx={{
              p: 2,
              backgroundColor: '#f5f5f5',
              borderRadius: 1,
              mb: 2,
            }}>
            <Typography variant='body2' sx={{ fontWeight: 600 }}>
              Name: {confirmationData?.existingCustomer?.name}
            </Typography>
            <Typography variant='body2' sx={{ color: 'text.secondary' }}>
              Email: {confirmationData?.existingCustomer?.email}
            </Typography>
          </Box>
          <Typography variant='body1' sx={{ mb: 2 }}>
            You entered: <strong>{confirmationData?.inputName}</strong>
          </Typography>
          <Typography variant='body2' sx={{ color: 'text.secondary' }}>
            Is this your account? If yes, we'll check you in. If not, please
            check your information.
          </Typography>
        </DialogContent>
        <DialogActions
          sx={{
            px: 3,
            py: 2,
            borderTop: '1px solid #e0e0e0',
          }}>
          <Button
            onClick={handleCancelConfirmation}
            disabled={isLoading}
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
            onClick={handleConfirmCheckIn}
            variant='contained'
            disabled={isLoading}
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
            {isLoading ? (
              <CircularProgress size={20} sx={{ color: 'white' }} />
            ) : (
              'Yes, Check Me In'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default CheckInPage;
