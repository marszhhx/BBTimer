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
  Divider,
} from '@mui/material';
import {
  addCustomerAndCheckIn,
  addCheckIn,
  isCustomerCheckedIn,
  updateCheckOut,
  checkCustomerByEmail,
  getCustomerCheckInTime,
  subscribeToSettings,
} from '../services/firebaseService';
import moment from 'moment-timezone';

function SelfServicePortal() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationData, setConfirmationData] = useState(null);

  // 新增状态
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [checkInTime, setCheckInTime] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [maxStayTime, setMaxStayTime] = useState(3600); // Default 60 minutes in seconds
  const [isOvertime, setIsOvertime] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // 加载用户信息并检查状态
  useEffect(() => {
    const savedUserInfo = localStorage.getItem('bbtimer_user_info');
    if (savedUserInfo) {
      try {
        const userInfo = JSON.parse(savedUserInfo);
        setFirstName(userInfo.firstName || '');
        setLastName(userInfo.lastName || '');
        setEmail(userInfo.email || '');

        // 检查用户是否已签到
        checkUserStatus(userInfo.email);
      } catch (error) {
        console.error('Error loading saved user info:', error);
      }
    }
  }, []);

  // 订阅设置以获取最大停留时间
  useEffect(() => {
    const unsubscribeSettings = subscribeToSettings((settings) => {
      if (settings.maxStayTime) {
        setMaxStayTime(settings.maxStayTime);
      }
    });

    return () => {
      unsubscribeSettings();
    };
  }, []);

  // 实时更新当前时间
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 检查用户签到状态
  const checkUserStatus = async (email) => {
    try {
      const customer = await checkCustomerByEmail(email);
      if (customer) {
        const checkedIn = await isCustomerCheckedIn(customer.id);
        setIsCheckedIn(checkedIn);
        if (checkedIn) {
          setCurrentUser(customer);
          // 从localStorage获取签到时间
          const savedCheckInTime = localStorage.getItem('bbtimer_checkin_time');
          setCheckInTime(savedCheckInTime || new Date().toISOString());
        }
      }
    } catch (error) {
      console.error('Error checking user status:', error);
    }
  };

  // 保存用户信息
  const saveUserInfo = (firstName, lastName, email) => {
    const userInfo = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
    };
    localStorage.setItem('bbtimer_user_info', JSON.stringify(userInfo));
  };

  // 保存签到时间
  const saveCheckInTime = () => {
    const now = new Date().toISOString();
    localStorage.setItem('bbtimer_checkin_time', now);
    setCheckInTime(now);
  };

  // 清除签到时间
  const clearCheckInTime = () => {
    localStorage.removeItem('bbtimer_checkin_time');
    setCheckInTime(null);
  };

  // 计算停留时间
  const getStayDuration = () => {
    if (!checkInTime) return '0h 0m 0s';
    const duration = moment.duration(currentTime - new Date(checkInTime));
    const hours = Math.floor(duration.asHours());
    const minutes = duration.minutes();
    const seconds = duration.seconds();
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  // 检查是否超时
  const checkOvertime = () => {
    if (!checkInTime) return false;
    const duration = moment.duration(currentTime - new Date(checkInTime));
    const totalSeconds = duration.asSeconds();
    return totalSeconds > maxStayTime;
  };

  // 更新超时状态
  useEffect(() => {
    if (isCheckedIn && checkInTime) {
      const overtime = checkOvertime();
      setIsOvertime(overtime);
    } else {
      setIsOvertime(false);
    }
  }, [currentTime, checkInTime, isCheckedIn, maxStayTime]);

  // Check-out处理
  const handleCheckOut = async () => {
    if (!currentUser) return;

    setIsLoading(true);
    setMessage('');

    try {
      const today = moment().tz('America/Vancouver').format('YYYY-MM-DD');
      await updateCheckOut(today, currentUser.id);

      setMessage(
        `Thank you for visiting, ${currentUser.name}! You have been successfully checked out.`
      );
      setMessageType('success');

      setIsCheckedIn(false);
      setCurrentUser(null);
      clearCheckInTime();

      // 3秒后清空表单
      setTimeout(() => {
        setFirstName('');
        setLastName('');
        setEmail('');
        setMessage('');
      }, 3000);
    } catch (error) {
      console.error('Check-out error:', error);
      setMessage(
        'An error occurred during check-out. Please contact a floor lead.'
      );
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
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

        // 保存用户信息和签到时间
        saveUserInfo(firstName, lastName, email);
        saveCheckInTime();

        // 更新状态
        setIsCheckedIn(true);
        setCurrentUser(result.customer);

        // 清空表单
        setFirstName('');
        setLastName('');
        setEmail('');
      } else if (result.needsConfirmation) {
        // Show confirmation dialog
        setConfirmationData(result);
        setShowConfirmation(true);
      } else if (result.alreadyCheckedIn) {
        // User is already checked in - show their current check-in info
        setMessage(
          `Welcome back ${result.customer.name}! You are already checked in.`
        );
        setMessageType('success');

        // 保存用户信息
        saveUserInfo(firstName, lastName, email);

        // 设置当前用户状态
        setIsCheckedIn(true);
        setCurrentUser(result.customer);

        // 从数据库获取实际的签到时间
        const actualCheckInTime = await getCustomerCheckInTime(
          result.customer.id
        );
        if (actualCheckInTime) {
          setCheckInTime(actualCheckInTime);
          // 同时保存到localStorage以便后续使用
          localStorage.setItem('bbtimer_checkin_time', actualCheckInTime);
        } else {
          // 如果无法获取实际时间，使用当前时间作为默认值
          const now = new Date().toISOString();
          setCheckInTime(now);
        }

        // 清空表单
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
        // User is already checked in - show their current check-in info
        setMessage(
          `Welcome back ${confirmationData.existingCustomer.name}! You are already checked in.`
        );
        setMessageType('success');

        // 保存用户信息
        saveUserInfo(firstName, lastName, email);

        // 设置当前用户状态
        setIsCheckedIn(true);
        setCurrentUser(confirmationData.existingCustomer);

        // 从数据库获取实际的签到时间
        const actualCheckInTime = await getCustomerCheckInTime(
          confirmationData.existingCustomer.id
        );
        if (actualCheckInTime) {
          setCheckInTime(actualCheckInTime);
          // 同时保存到localStorage以便后续使用
          localStorage.setItem('bbtimer_checkin_time', actualCheckInTime);
        } else {
          // 如果无法获取实际时间，使用当前时间作为默认值
          const now = new Date().toISOString();
          setCheckInTime(now);
        }

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

      // 保存用户信息和签到时间
      saveUserInfo(firstName, lastName, email);
      saveCheckInTime();

      // 更新状态
      setIsCheckedIn(true);
      setCurrentUser(confirmationData.existingCustomer);

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

  // 渲染Check-out界面
  const renderCheckOutView = () => (
    <Box>
      <Typography
        variant='h5'
        component='h1'
        gutterBottom
        sx={{
          textAlign: 'center',
          fontWeight: 600,
          mb: 2,
          color: isOvertime ? '#d32f2f' : 'inherit',
        }}>
        {currentUser?.name}
      </Typography>

      {isOvertime ? (
        <Alert
          severity='warning'
          sx={{
            mb: 3,
            borderRadius: 0,
            backgroundColor: '#fff3e0',
            border: '1px solid #ff9800',
            '& .MuiAlert-icon': {
              color: '#f57c00',
            },
          }}>
          <Typography variant='body2' sx={{ fontWeight: 500 }}>
            You have exceeded the allowed {Math.floor(maxStayTime / 60)}{' '}
            minutes. Please check out.
          </Typography>
        </Alert>
      ) : (
        <Alert
          severity='success'
          sx={{
            mb: 3,
            borderRadius: 0,
            backgroundColor: '#f1f8e9',
            border: '1px solid #4caf50',
            '& .MuiAlert-icon': {
              color: '#2e7d32',
            },
          }}>
          <Typography variant='body2' sx={{ fontWeight: 500 }}>
            Successfully checked in. You can stay for up to{' '}
            {Math.floor(maxStayTime / 60)} minutes.
          </Typography>
        </Alert>
      )}

      <Box
        sx={{
          mb: 3,
          p: 2,
          border: isOvertime ? '1px solid #d32f2f' : '1px solid #e0e0e0',
          backgroundColor: isOvertime ? '#fff5f5' : '#fafafa',
          textAlign: 'center',
        }}>
        <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
          Check-in:{' '}
          {checkInTime ? moment(checkInTime).format('HH:mm:ss') : 'N/A'}
        </Typography>
        <Typography
          variant='h6'
          sx={{
            color: isOvertime ? '#d32f2f' : 'text.primary',
            fontWeight: 600,
          }}>
          {getStayDuration()}
          {isOvertime && ' (OVERTIME)'}
        </Typography>
      </Box>

      <Button
        fullWidth
        variant='contained'
        onClick={handleCheckOut}
        disabled={isLoading}
        sx={{
          py: 2,
          backgroundColor: isOvertime ? '#d32f2f' : '#1976d2',
          borderRadius: 0,
          textTransform: 'none',
          fontSize: '1.1rem',
          fontWeight: 600,
          '&:hover': {
            backgroundColor: isOvertime ? '#b71c1c' : '#1565c0',
          },
          '&:disabled': {
            backgroundColor: '#e0e0e0',
          },
          animation: isOvertime ? 'pulse 2s infinite' : 'none',
          '@keyframes pulse': {
            '0%': {
              boxShadow: '0 0 0 0 rgba(211, 47, 47, 0.7)',
            },
            '70%': {
              boxShadow: '0 0 0 10px rgba(211, 47, 47, 0)',
            },
            '100%': {
              boxShadow: '0 0 0 0 rgba(211, 47, 47, 0)',
            },
          },
        }}>
        {isLoading ? (
          <CircularProgress size={24} sx={{ color: 'white' }} />
        ) : isOvertime ? (
          'Check Out Now'
        ) : (
          'Check Out'
        )}
      </Button>
    </Box>
  );

  // 渲染Check-in界面
  const renderCheckInView = () => (
    <Box>
      <Typography
        variant='h4'
        component='h1'
        gutterBottom
        sx={{ textAlign: 'center', fontWeight: 700, mb: 3 }}>
        Welcome to Check-in
      </Typography>

      <Typography
        variant='body1'
        sx={{ textAlign: 'center', color: 'text.secondary', mb: 4 }}>
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
            isLoading || !firstName.trim() || !lastName.trim() || !email.trim()
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
    </Box>
  );

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
            border: isOvertime ? '2px solid #d32f2f' : '1px solid #e0e0e0',
            borderRadius: 0,
            backgroundColor: isOvertime ? '#fff5f5' : 'inherit',
            transition: 'all 0.3s ease',
          }}>
          {isCheckedIn ? renderCheckOutView() : renderCheckInView()}
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
        <DialogTitle sx={{ pb: 2, borderBottom: '1px solid #e0e0e0' }}>
          Account Found
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant='body1' sx={{ mb: 2 }}>
            An account with this email address already exists:
          </Typography>
          <Box
            sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 1, mb: 2 }}>
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
        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #e0e0e0' }}>
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

export default SelfServicePortal;
