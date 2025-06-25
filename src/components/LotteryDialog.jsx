import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Paper,
  Chip,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Divider,
} from '@mui/material';
import CasinoIcon from '@mui/icons-material/Casino';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

function LotteryDialog({ open, onClose, activeCustomers }) {
  const [itemCount, setItemCount] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [lotteryResults, setLotteryResults] = useState(null);
  const [error, setError] = useState('');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // 重置状态当对话框打开时
  useEffect(() => {
    if (open) {
      setItemCount('');
      setLotteryResults(null);
      setError('');
    }
  }, [open]);

  // 计算分配结果
  const calculateDistribution = (items, customers) => {
    if (customers.length === 0) return null;

    const baseItemsPerPerson = Math.floor(items / customers.length);
    const remainingItems = items % customers.length;

    // 创建基础分配
    const distribution = customers.map((customer) => ({
      customer,
      items: baseItemsPerPerson,
    }));

    // 如果有剩余物品，随机分配给一些人
    if (remainingItems > 0) {
      const shuffledCustomers = [...customers].sort(() => Math.random() - 0.5);
      for (let i = 0; i < remainingItems; i++) {
        const luckyCustomer = shuffledCustomers[i];
        const distributionItem = distribution.find(
          (d) => d.customer.id === luckyCustomer.id
        );
        if (distributionItem) {
          distributionItem.items += 1;
        }
      }
    }

    return distribution;
  };

  // 执行抽签
  const handleDraw = () => {
    const count = parseInt(itemCount);
    if (!count || count <= 0) {
      setError('Please enter a valid number of items.');
      return;
    }

    if (activeCustomers.length === 0) {
      setError('No customers are currently checked in.');
      return;
    }

    setIsDrawing(true);
    setError('');

    // 模拟抽签动画
    setTimeout(() => {
      const results = calculateDistribution(count, activeCustomers);
      setLotteryResults(results);
      setIsDrawing(false);
    }, 2000);
  };

  // 重置抽签
  const handleReset = () => {
    setItemCount('');
    setLotteryResults(null);
    setError('');
  };

  // 关闭对话框
  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth='sm'
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: 0,
          border: '1px solid #e0e0e0',
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
      <DialogTitle sx={{ pb: 2, borderBottom: '1px solid #e0e0e0' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CasinoIcon />
          <Typography variant='h6'>LOTTERY</Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        {!lotteryResults ? (
          // 抽签设置界面
          <Box>
            <Alert severity='info' sx={{ mb: 3, borderRadius: 0 }}>
              <Typography variant='body2'>
                <strong>Current Check-ins:</strong> {activeCustomers.length}{' '}
                customer{activeCustomers.length !== 1 ? 's' : ''}
              </Typography>
            </Alert>

            <TextField
              fullWidth
              label='Number of Items to Distribute'
              type='number'
              value={itemCount}
              onChange={(e) => setItemCount(e.target.value)}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 0,
                },
              }}
            />

            {error && (
              <Alert severity='error' sx={{ mb: 3, borderRadius: 0 }}>
                {error}
              </Alert>
            )}
          </Box>
        ) : (
          // 抽签结果界面
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <EmojiEventsIcon sx={{ color: '#ffd700' }} />
              <Typography variant='h6'>Lottery Results</Typography>
            </Box>

            <Alert severity='success' sx={{ mb: 3, borderRadius: 0 }}>
              <Typography variant='body2'>
                Successfully distributed <strong>{itemCount}</strong> item
                {parseInt(itemCount) !== 1 ? 's' : ''} among{' '}
                <strong>{activeCustomers.length}</strong> customer
                {activeCustomers.length !== 1 ? 's' : ''}.
              </Typography>
            </Alert>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {lotteryResults.map((result) => (
                <Paper
                  key={result.customer.id}
                  sx={{
                    p: 2,
                    border: '1px solid #e0e0e0',
                    borderRadius: 0,
                    backgroundColor:
                      result.items >
                      Math.floor(parseInt(itemCount) / activeCustomers.length)
                        ? '#fff3e0'
                        : '#f5f5f5',
                  }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                    <Box>
                      <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
                        {result.customer.name}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={`${result.items} item${
                          result.items !== 1 ? 's' : ''
                        }`}
                        color={
                          result.items >
                          Math.floor(
                            parseInt(itemCount) / activeCustomers.length
                          )
                            ? 'warning'
                            : 'default'
                        }
                        variant='outlined'
                      />
                      {result.items >
                        Math.floor(
                          parseInt(itemCount) / activeCustomers.length
                        ) && (
                        <Chip
                          label='Lucky!'
                          color='warning'
                          size='small'
                          icon={<EmojiEventsIcon />}
                        />
                      )}
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #e0e0e0' }}>
        {!lotteryResults ? (
          <>
            <Button
              onClick={handleClose}
              disabled={isDrawing}
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
              onClick={handleDraw}
              variant='contained'
              disabled={isDrawing || !itemCount || activeCustomers.length === 0}
              startIcon={
                isDrawing ? <CircularProgress size={20} /> : <CasinoIcon />
              }
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
              {isDrawing ? 'Drawing...' : 'Draw Lottery'}
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={handleReset}
              sx={{
                color: theme.palette.text.primary,
                '&:hover': {
                  backgroundColor: 'transparent',
                  color: theme.palette.text.secondary,
                },
              }}>
              New Lottery
            </Button>
            <Button
              onClick={handleClose}
              variant='contained'
              sx={{
                backgroundColor: 'black',
                '&:hover': {
                  backgroundColor: '#333',
                },
                transition: 'all 0.2s ease-in-out',
                '&:active': {
                  transform: 'scale(0.98)',
                },
              }}>
              Close
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default LotteryDialog;
