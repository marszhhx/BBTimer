import { useState, useEffect } from 'react';
import {
  Button,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  useTheme,
  Grid,
  Card,
  CardContent,
  CardActions,
  useMediaQuery,
  Alert,
  Fade,
} from '@mui/material';
import { differenceInMinutes } from 'date-fns';
import moment from 'moment-timezone';

function CustomerList({
  customers,
  activeCheckIns,
  onCheckIn,
  onCheckOut,
  onRegisterNewCustomer,
  maxStayTime,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showRegisterOption, setShowRegisterOption] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Force update when maxStayTime changes
  useEffect(() => {
    setCurrentTime(new Date());
  }, [maxStayTime]);

  // Regular timer update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getActiveCheckIn = (customerId) => {
    return activeCheckIns.find((checkIn) => checkIn.customerId === customerId);
  };

  const formatDuration = (startTime) => {
    const minutes = differenceInMinutes(currentTime, new Date(startTime));
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    const seconds = Math.floor((currentTime - new Date(startTime)) / 1000) % 60;
    return `${hours}h ${remainingMinutes}m ${seconds}s`;
  };

  const activeCustomers = customers.filter((customer) =>
    getActiveCheckIn(customer.id)
  );

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCheckInClick = () => {
    setIsSearchOpen(true);
    setShowRegisterOption(false);
    setErrorMessage('');
  };

  const handleCustomerSelect = (customer) => {
    // Check if customer is already checked in
    const activeCheckIn = getActiveCheckIn(customer.id);
    if (activeCheckIn) {
      setErrorMessage(
        `${customer.name} is already checked in. Please check them out first.`
      );
      return;
    }

    onCheckIn(customer.id);
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    // If search query is empty, hide register option
    if (!query.trim()) {
      setShowRegisterOption(false);
      setErrorMessage('');
      return;
    }

    // Check if any customers match the search query
    const matches = customers.some((customer) =>
      customer.name.toLowerCase().includes(query.toLowerCase())
    );

    // Show register option if no matches found
    setShowRegisterOption(!matches);
  };

  const handleRegisterClick = () => {
    if (onRegisterNewCustomer) {
      onRegisterNewCustomer(searchQuery);
      setIsSearchOpen(false);
      setSearchQuery('');
      setShowRegisterOption(false);
    }
  };

  const formatCurrentDateTime = () => {
    return moment().tz('America/Vancouver').format('ddd, MMM DD, HH:mm:ss');
  };

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
      <Box
        sx={{
          position: 'fixed',
          top: { xs: '20px', sm: '30px', md: '40px' },
          left: 0,
          right: 0,
          zIndex: 90,
          backgroundColor: 'background.default',
          py: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
        }}>
        <Typography
          variant='h6'
          sx={{
            mb: 2,
            fontWeight: 500,
            fontSize: { xs: '0.875rem', sm: '1rem', md: '1.25rem' },
            fontFamily: 'monospace',
          }}>
          {formatCurrentDateTime()}
        </Typography>
        <Button
          variant='contained'
          onClick={handleCheckInClick}
          size={isMobile ? 'medium' : 'large'}
          sx={{
            backgroundColor: 'black',
            '&:hover': {
              backgroundColor: '#333',
            },
            fontWeight: 600,
            fontSize: isMobile ? '0.875rem' : '1rem',
            padding: isMobile ? '8px 16px' : '12px 24px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            transition: 'all 0.2s ease-in-out',
            '&:active': {
              transform: 'scale(0.98)',
            },
          }}>
          CHECK IN
        </Button>
      </Box>

      <Box
        sx={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          mt: { xs: '100px', sm: '120px', md: '140px' },
        }}>
        {activeCustomers.length === 0 ? (
          <Box sx={{ height: 200 }} />
        ) : (
          <Fade in={true} timeout={500}>
            <Grid
              container
              spacing={isMobile ? 2 : 3}
              sx={{
                maxWidth: '100%',
                width: '100%',
                px: { xs: 2, sm: 3, md: 4 },
                justifyContent: 'flex-start',
              }}>
              {activeCustomers.map((customer) => {
                const activeCheckIn = getActiveCheckIn(customer.id);
                const isOverTime =
                  activeCheckIn &&
                  Math.floor(
                    (currentTime - new Date(activeCheckIn.checkInTime)) / 1000
                  ) > maxStayTime;

                return (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={customer.id}>
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 0,
                        border: '1px solid #e0e0e0',
                        boxShadow: 'none',
                        backgroundColor: isOverTime ? '#fff5f5' : 'white',
                        '&:hover': {
                          backgroundColor: isOverTime ? '#fff0f0' : '#f8f8f8',
                          transform: 'translateY(-2px)',
                          transition: 'all 0.2s ease-in-out',
                        },
                      }}>
                      <CardContent
                        sx={{ flexGrow: 1, pb: 1, p: isMobile ? 2 : 3 }}>
                        <Typography
                          variant='h6'
                          component='div'
                          sx={{
                            fontWeight: 500,
                            mb: 2,
                            fontSize: isMobile ? '1rem' : '1.25rem',
                          }}>
                          {customer.name}
                        </Typography>

                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            mb: 1,
                          }}>
                          <Typography variant='body2' fontWeight={500}>
                            {formatDuration(activeCheckIn.checkInTime)}
                          </Typography>
                        </Box>
                      </CardContent>

                      <CardActions sx={{ p: isMobile ? 1 : 2 }}>
                        <Button
                          fullWidth
                          variant='outlined'
                          onClick={() => onCheckOut(activeCheckIn)}
                          sx={{
                            borderColor: 'black',
                            color: 'black',
                            '&:hover': {
                              borderColor: 'black',
                              backgroundColor: '#f0f0f0',
                            },
                          }}>
                          Check Out
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Fade>
        )}
      </Box>

      <Dialog
        open={isSearchOpen}
        onClose={() => {
          setIsSearchOpen(false);
          setSearchQuery('');
          setShowRegisterOption(false);
          setErrorMessage('');
        }}
        fullWidth
        maxWidth='sm'
        PaperProps={{
          sx: {
            borderRadius: 0,
          },
        }}>
        <DialogTitle>Check In Customer</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin='dense'
            label='Search Customer'
            type='text'
            fullWidth
            variant='outlined'
            value={searchQuery}
            onChange={handleSearchChange}
            sx={{ mt: 2 }}
          />
          {errorMessage && (
            <Alert severity='error' sx={{ mt: 2 }}>
              {errorMessage}
            </Alert>
          )}
          {showRegisterOption && (
            <Alert severity='info' sx={{ mt: 2 }}>
              No customer found. Would you like to register a new customer?
            </Alert>
          )}
          <List sx={{ mt: 2 }}>
            {filteredCustomers.map((customer) => (
              <ListItem
                key={customer.id}
                disablePadding
                sx={{
                  borderBottom: '1px solid #e0e0e0',
                  '&:last-child': {
                    borderBottom: 'none',
                  },
                }}>
                <ListItemButton
                  onClick={() => handleCustomerSelect(customer)}
                  sx={{
                    py: 2,
                    '&:hover': {
                      backgroundColor: '#f8f8f8',
                    },
                  }}>
                  <ListItemText
                    primary={customer.name}
                    primaryTypographyProps={{
                      fontWeight: 500,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setIsSearchOpen(false);
              setSearchQuery('');
              setShowRegisterOption(false);
              setErrorMessage('');
            }}>
            Cancel
          </Button>
          {showRegisterOption && (
            <Button onClick={handleRegisterClick} variant='contained'>
              Register & Check In
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default CustomerList;
