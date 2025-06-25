import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  ThemeProvider,
  createTheme,
  useMediaQuery,
  IconButton,
  Tooltip,
  Button,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import QrCodeIcon from '@mui/icons-material/QrCode';
import CasinoIcon from '@mui/icons-material/Casino';
import CheckInManager from './CheckInManager';
import NewCustomerDialog from './NewCustomerDialog';
import SettingsDialog from './SettingsDialog';
import LotteryDialog from './LotteryDialog';
import {
  addCustomer,
  subscribeToCustomers,
  addCheckIn,
  updateCheckOut,
  subscribeToActiveCheckIns,
  updateSettings,
  subscribeToSettings,
  updateCheckInTime,
} from '../services/firebaseService';

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#000000',
    },
    secondary: {
      main: '#666666',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 600 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 500 },
    h5: { fontWeight: 500 },
    h6: { fontWeight: 500 },
    button: { fontWeight: 700, letterSpacing: 1 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 0,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 0,
        },
      },
    },
  },
});

function AdminDashboard() {
  const [customers, setCustomers] = useState([]);
  const [activeCheckIns, setActiveCheckIns] = useState([]);
  const [isCustomerFormOpen, setIsCustomerFormOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLotteryOpen, setIsLotteryOpen] = useState(false);
  const [maxStayTime, setMaxStayTime] = useState(3600); // 60 minutes (in seconds)
  const [newCustomerName, setNewCustomerName] = useState('');
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Subscribe to Firebase data
  useEffect(() => {
    const unsubscribeCustomers = subscribeToCustomers(setCustomers);
    const unsubscribeActiveCheckIns =
      subscribeToActiveCheckIns(setActiveCheckIns);
    const unsubscribeSettings = subscribeToSettings((settings) => {
      if (settings.maxStayTime) {
        setMaxStayTime(settings.maxStayTime);
      }
    });

    return () => {
      unsubscribeCustomers();
      unsubscribeActiveCheckIns();
      unsubscribeSettings();
    };
  }, []);

  // 获取当前check-in的客户列表
  const activeCustomers = customers.filter((customer) =>
    activeCheckIns.some((checkIn) => checkIn.customerId === customer.id)
  );

  const capitalizeWords = (str) => {
    return str
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const handleAddCustomer = async (name) => {
    const capitalizedName = capitalizeWords(name);
    const newCustomer = await addCustomer(capitalizedName);
    return newCustomer;
  };

  const handleCheckIn = async (customerId) => {
    await addCheckIn(customerId);
  };

  const handleCheckOut = async (checkIn) => {
    await updateCheckOut(checkIn.date, checkIn.customerId);
  };

  const handleUpdateCheckInTime = async (checkIn, newCheckInTime) => {
    await updateCheckInTime(checkIn.date, checkIn.customerId, newCheckInTime);
  };

  const handleRegisterNewCustomer = async (name) => {
    const newCustomer = await handleAddCustomer(name);
    await handleCheckIn(newCustomer.id);
  };

  const handleMaxStayTimeChange = async (newMaxStayTime) => {
    setMaxStayTime(newMaxStayTime);
    await updateSettings({ maxStayTime: newMaxStayTime });
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: 'background.default',
          position: 'relative',
          overflow: 'hidden',
          pt: { xs: 4, sm: 5, md: 6 },
        }}>
        <Container
          maxWidth={false}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            width: '100%',
            px: { xs: 2, sm: 3, md: 4 },
          }}>
          <Box sx={{ width: '100%' }}>
            <CheckInManager
              customers={customers}
              activeCheckIns={activeCheckIns}
              onCheckIn={handleCheckIn}
              onCheckOut={handleCheckOut}
              onUpdateCheckInTime={handleUpdateCheckInTime}
              onRegisterNewCustomer={handleRegisterNewCustomer}
              maxStayTime={maxStayTime}
              onLotteryClick={() => setIsLotteryOpen(true)}
              activeCustomers={activeCustomers}
            />
          </Box>
        </Container>

        {/* QR Code Button */}
        <Tooltip title='Generate QR Code'>
          <IconButton
            onClick={() => window.open('/qr', '_blank')}
            sx={{
              position: 'fixed',
              bottom: 16,
              right: isMobile ? 80 : 80,
              backgroundColor: 'background.paper',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              '&:hover': {
                backgroundColor: 'background.paper',
              },
            }}>
            <QrCodeIcon />
          </IconButton>
        </Tooltip>

        {/* Settings Button */}
        <Tooltip title='Settings'>
          <IconButton
            onClick={() => setIsSettingsOpen(true)}
            sx={{
              position: 'fixed',
              bottom: 16,
              right: 16,
              backgroundColor: 'background.paper',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              '&:hover': {
                backgroundColor: 'background.paper',
              },
            }}>
            <SettingsIcon />
          </IconButton>
        </Tooltip>

        <NewCustomerDialog
          open={isCustomerFormOpen}
          onClose={() => {
            setIsCustomerFormOpen(false);
            setNewCustomerName('');
          }}
          onSubmit={handleAddCustomer}
          initialName={newCustomerName}
        />

        <SettingsDialog
          open={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          maxStayTime={maxStayTime}
          onMaxStayTimeChange={handleMaxStayTimeChange}
        />

        <LotteryDialog
          open={isLotteryOpen}
          onClose={() => setIsLotteryOpen(false)}
          activeCustomers={activeCustomers}
        />
      </Box>
    </ThemeProvider>
  );
}

export default AdminDashboard;
