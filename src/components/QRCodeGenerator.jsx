import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Chip,
  Alert,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';
import QRCode from 'qrcode';
import moment from 'moment-timezone';

function QRCodeGenerator() {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(true);
  const [error, setError] = useState('');
  const [nextUpdateTime, setNextUpdateTime] = useState(null);
  const [currentTimestamp, setCurrentTimestamp] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // QR码更新间隔 (5分钟)
  const QR_UPDATE_INTERVAL = 5 * 60 * 1000; // 5分钟

  useEffect(() => {
    generateQRCode();

    // 设置定时器，每5分钟自动更新QR码
    const interval = setInterval(() => {
      generateQRCode();
    }, QR_UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  // 计算下一个更新时间
  const calculateNextUpdateTime = () => {
    const now = Date.now();
    const nextUpdate = Math.ceil(now / QR_UPDATE_INTERVAL) * QR_UPDATE_INTERVAL;
    return nextUpdate;
  };

  // 生成时间戳 (每5分钟更新一次)
  const generateTimestamp = () => {
    return Math.floor(Date.now() / QR_UPDATE_INTERVAL);
  };

  const generateQRCode = async () => {
    try {
      setIsGenerating(true);
      setError('');

      // 生成当前时间戳
      const timestamp = generateTimestamp();
      setCurrentTimestamp(timestamp);

      // 计算下一个更新时间
      const nextUpdate = calculateNextUpdateTime();
      setNextUpdateTime(nextUpdate);

      // 获取当前URL并创建带时间戳的check-in页面URL
      const currentUrl = window.location.origin;
      const checkInUrl = `${currentUrl}/checkin?t=${timestamp}`;

      console.log('=== QR Code Generation Debug ===');
      console.log('Current time (ms):', Date.now());
      console.log('QR_UPDATE_INTERVAL (ms):', QR_UPDATE_INTERVAL);
      console.log('Generated timestamp:', timestamp);
      console.log('Check-in URL:', checkInUrl);
      console.log('Next update time:', new Date(nextUpdate).toLocaleString());
      console.log('================================');

      // 生成QR码
      const dataUrl = await QRCode.toDataURL(checkInUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      setQrCodeDataUrl(dataUrl);
    } catch (err) {
      console.error('Error generating QR code:', err);
      setError('Failed to generate QR code. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeDataUrl) return;

    const link = document.createElement('a');
    link.download = `checkin-qr-code-${currentTimestamp}.png`;
    link.href = qrCodeDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 格式化剩余时间
  const formatTimeUntilUpdate = () => {
    if (!nextUpdateTime) return '';

    const now = Date.now();
    const timeLeft = nextUpdateTime - now;

    if (timeLeft <= 0) return 'Updating...';

    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);

    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // 实时更新倒计时
  useEffect(() => {
    if (!nextUpdateTime) return;

    const timer = setInterval(() => {
      // 强制重新渲染以更新倒计时
      setNextUpdateTime(calculateNextUpdateTime());
    }, 1000);

    return () => clearInterval(timer);
  }, [nextUpdateTime]);

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
              mb: 2,
            }}>
            Dynamic QR Code Generator
          </Typography>

          <Typography
            variant='body1'
            sx={{
              textAlign: 'center',
              color: 'text.secondary',
              mb: 2,
            }}>
            Scan this QR code to access the self-check-in page
          </Typography>

          <Alert severity='info' sx={{ mb: 3, borderRadius: 0 }}>
            <Typography variant='body2'>
              <strong>Security Feature:</strong> This QR code updates every 5
              minutes to prevent early check-ins.
            </Typography>
          </Alert>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 4,
            }}>
            {isGenerating ? (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                }}>
                <CircularProgress size={60} />
                <Typography variant='body2' color='text.secondary'>
                  Generating QR Code...
                </Typography>
              </Box>
            ) : error ? (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                }}>
                <Typography color='error' variant='body2'>
                  {error}
                </Typography>
                <Button
                  variant='outlined'
                  onClick={generateQRCode}
                  sx={{
                    borderRadius: 0,
                    textTransform: 'none',
                  }}>
                  Try Again
                </Button>
              </Box>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 3,
                }}>
                {/* 时间戳显示 */}
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Chip
                    label={`Timestamp: ${currentTimestamp}`}
                    variant='outlined'
                    size='small'
                  />
                  <Chip
                    label={`Next update: ${formatTimeUntilUpdate()}`}
                    color='primary'
                    size='small'
                  />
                </Box>

                <Box
                  sx={{
                    border: '2px solid #e0e0e0',
                    p: 2,
                    borderRadius: 1,
                  }}>
                  <img
                    src={qrCodeDataUrl}
                    alt='Dynamic QR Code for Check-in'
                    style={{
                      width: '300px',
                      height: '300px',
                      maxWidth: '100%',
                    }}
                  />
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                  }}>
                  <Button
                    variant='contained'
                    startIcon={<DownloadIcon />}
                    onClick={downloadQRCode}
                    sx={{
                      backgroundColor: 'black',
                      borderRadius: 0,
                      textTransform: 'none',
                      px: 3,
                      py: 1.5,
                      '&:hover': {
                        backgroundColor: '#333',
                      },
                    }}>
                    Download QR Code
                  </Button>

                  <Button
                    variant='outlined'
                    startIcon={<RefreshIcon />}
                    onClick={generateQRCode}
                    sx={{
                      borderRadius: 0,
                      textTransform: 'none',
                      px: 3,
                      py: 1.5,
                    }}>
                    Refresh Now
                  </Button>
                </Box>
              </Box>
            )}
          </Box>

          <Typography
            variant='body2'
            sx={{
              textAlign: 'center',
              color: 'text.secondary',
              fontStyle: 'italic',
            }}>
            Display this QR code in your location for customers to scan and
            check in. The code automatically updates every 5 minutes for
            security.
          </Typography>

          {/* 测试信息 */}
          <Box
            sx={{ mt: 4, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant='h6' sx={{ mb: 2, fontWeight: 600 }}>
              Test Information
            </Typography>
            <Typography variant='body2' sx={{ mb: 1 }}>
              <strong>Current Timestamp:</strong> {currentTimestamp}
            </Typography>
            <Typography variant='body2' sx={{ mb: 1 }}>
              <strong>Check-in URL:</strong>{' '}
              {currentTimestamp
                ? `${window.location.origin}/checkin?t=${currentTimestamp}`
                : 'Generating...'}
            </Typography>
            <Typography variant='body2' sx={{ mb: 1 }}>
              <strong>Next Update:</strong>{' '}
              {nextUpdateTime
                ? moment(nextUpdateTime).format('HH:mm:ss')
                : 'Calculating...'}
            </Typography>

            {/* 测试链接 */}
            <Box
              sx={{
                mt: 2,
                p: 2,
                backgroundColor: '#fff',
                borderRadius: 1,
                border: '1px solid #ddd',
              }}>
              <Typography variant='subtitle2' sx={{ mb: 1, fontWeight: 600 }}>
                Test Links:
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant='body2'>
                  <strong>✅ Valid:</strong>{' '}
                  <a
                    href={`${window.location.origin}/checkin?t=${currentTimestamp}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    style={{ color: '#1976d2' }}>
                    Current QR Code
                  </a>
                </Typography>
                <Typography variant='body2'>
                  <strong>❌ Invalid:</strong>{' '}
                  <a
                    href={`${window.location.origin}/checkin`}
                    target='_blank'
                    rel='noopener noreferrer'
                    style={{ color: '#d32f2f' }}>
                    No Timestamp
                  </a>
                </Typography>
                <Typography variant='body2'>
                  <strong>❌ Expired:</strong>{' '}
                  <a
                    href={`${window.location.origin}/checkin?t=${
                      currentTimestamp - 10
                    }`}
                    target='_blank'
                    rel='noopener noreferrer'
                    style={{ color: '#d32f2f' }}>
                    Old Timestamp
                  </a>
                </Typography>
              </Box>
            </Box>

            <Typography
              variant='body2'
              sx={{ color: 'text.secondary', fontSize: '0.875rem', mt: 2 }}>
              Use these links to test the dynamic QR code functionality. Only
              the "Current QR Code" should work.
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default QRCodeGenerator;
