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
  IconButton,
  Tooltip,
} from '@mui/material';
import { differenceInMinutes } from 'date-fns';
import moment from 'moment-timezone';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import EditIcon from '@mui/icons-material/Edit';

function CheckInManager({
  customers,
  activeCheckIns,
  onCheckIn,
  onCheckOut,
  onUpdateCheckInTime,
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
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCheckIn, setEditingCheckIn] = useState(null);
  const [newCheckInTime, setNewCheckInTime] = useState('');

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
          startIcon={<LoginIcon sx={{ color: '#fff' }} />}
          sx={{
            backgroundColor: '#1976d2',
            color: '#fff',
            fontWeight: 700,
            fontSize: isMobile ? '0.95rem' : '1.1rem',
            borderRadius: 8,
            boxShadow: '0 2px 8px 0 rgba(25, 118, 210, 0.08)',
            padding: isMobile ? '8px 16px' : '12px 24px',
            transition: 'all 0.2s cubic-bezier(.4,2,.6,1)',
            '&:hover': {
              backgroundColor: '#1565c0',
              boxShadow: '0 4px 16px 0 rgba(25, 118, 210, 0.13)',
            },
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
          mt: { xs: '105px', sm: '125px', md: '145px' },
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
                        borderRadius: 2,
                        border: isOverTime
                          ? '2px solid #ff1744'
                          : '1px solid #e0e0e0',
                        boxShadow: isOverTime
                          ? 'none'
                          : '0 2px 12px 0 rgba(25, 118, 210, 0.06)',
                        backgroundColor: isOverTime ? '#ffeaea' : 'white',
                        '&:hover': {
                          backgroundColor: isOverTime ? '#ffd6d6' : '#f8f8f8',
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
                            color: isOverTime ? '#d50000' : 'inherit',
                          }}>
                          {customer.name}
                        </Typography>

                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            mb: 1,
                          }}>
                          <Typography
                            variant='body2'
                            fontWeight={500}
                            sx={{ color: isOverTime ? '#d50000' : 'inherit' }}>
                            {formatDuration(activeCheckIn.checkInTime)}
                          </Typography>
                        </Box>
                      </CardContent>

                      <CardActions sx={{ p: isMobile ? 1 : 2 }}>
                        <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
                          <Tooltip title='Edit Check-in Time'>
                            <IconButton
                              onClick={() => {
                                setEditingCheckIn(activeCheckIn);
                                setNewCheckInTime(
                                  moment(activeCheckIn.checkInTime).format(
                                    'YYYY-MM-DDTHH:mm'
                                  )
                                );
                                setIsEditDialogOpen(true);
                              }}
                              sx={{
                                border: '1px solid #e0e0e0',
                                borderRadius: '50%',
                                width: 40,
                                height: 40,
                                '&:hover': {
                                  backgroundColor: '#f5f5f5',
                                  borderColor: '#1976d2',
                                },
                              }}>
                              <EditIcon fontSize='small' />
                            </IconButton>
                          </Tooltip>
                          <Button
                            fullWidth
                            variant='outlined'
                            startIcon={<LogoutIcon />}
                            onClick={() => onCheckOut(activeCheckIn)}
                            sx={{
                              borderColor: isOverTime ? '#ff1744' : '#1976d2',
                              color: isOverTime ? '#ff1744' : '#1976d2',
                              fontWeight: 700,
                              fontSize: isMobile ? '1rem' : '1.1rem',
                              borderRadius: 8,
                              '&:hover': {
                                borderColor: isOverTime ? '#ff1744' : '#1565c0',
                                backgroundColor: isOverTime
                                  ? '#ffeaea'
                                  : '#e3f2fd',
                              },
                            }}>
                            Check Out
                          </Button>
                        </Box>
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
            margin: 0,
            position: 'absolute',
            top: { xs: '20px', sm: '30px', md: '40px' },
            left: '50%',
            transform: 'translateX(-50%)',
            maxHeight: 'calc(100vh - 100px)',
            '@media (max-height: 600px)': {
              top: '10px',
              maxHeight: 'calc(100vh - 50px)',
            },
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

      {/* Edit Check-in Time Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingCheckIn(null);
          setNewCheckInTime('');
        }}
        fullWidth
        maxWidth='sm'
        PaperProps={{
          sx: {
            borderRadius: 0,
            margin: 0,
            position: 'absolute',
            top: { xs: '20px', sm: '30px', md: '40px' },
            left: '50%',
            transform: 'translateX(-50%)',
            maxHeight: 'calc(100vh - 100px)',
            '@media (max-height: 600px)': {
              top: '10px',
              maxHeight: 'calc(100vh - 50px)',
            },
          },
        }}>
        <DialogTitle>Edit Check-in Time</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin='dense'
            label='Check-in Time'
            type='datetime-local'
            fullWidth
            variant='outlined'
            value={
              newCheckInTime
                ? moment(newCheckInTime).format('YYYY-MM-DDTHH:mm')
                : ''
            }
            onChange={(e) => setNewCheckInTime(e.target.value)}
            sx={{ mt: 2 }}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
            Current check-in time:{' '}
            {editingCheckIn
              ? moment(editingCheckIn.checkInTime).format('YYYY-MM-DD HH:mm:ss')
              : ''}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setIsEditDialogOpen(false);
              setEditingCheckIn(null);
              setNewCheckInTime('');
            }}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (onUpdateCheckInTime && editingCheckIn && newCheckInTime) {
                const isoTime = moment(newCheckInTime).toISOString();
                onUpdateCheckInTime(editingCheckIn, isoTime);
                setIsEditDialogOpen(false);
                setEditingCheckIn(null);
                setNewCheckInTime('');
              }
            }}
            variant='contained'
            disabled={!newCheckInTime}>
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default CheckInManager;
