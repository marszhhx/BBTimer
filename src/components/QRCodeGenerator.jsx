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
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import QRCode from 'qrcode';

function QRCodeGenerator() {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(true);
  const [error, setError] = useState('');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    generateQRCode();
  }, []);

  const generateQRCode = async () => {
    try {
      setIsGenerating(true);
      setError('');

      // Get the current URL and create the check-in page URL
      const currentUrl = window.location.origin;
      const checkInUrl = `${currentUrl}/checkin`;

      // Generate QR code
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
    link.download = 'checkin-qr-code.png';
    link.href = qrCodeDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
              mb: 2,
            }}>
            QR Code Generator
          </Typography>

          <Typography
            variant='body1'
            sx={{
              textAlign: 'center',
              color: 'text.secondary',
              mb: 4,
            }}>
            Scan this QR code to access the self-check-in page
          </Typography>

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
                <Box
                  sx={{
                    border: '2px solid #e0e0e0',
                    p: 2,
                    borderRadius: 1,
                  }}>
                  <img
                    src={qrCodeDataUrl}
                    alt='QR Code for Check-in'
                    style={{
                      width: '300px',
                      height: '300px',
                      maxWidth: '100%',
                    }}
                  />
                </Box>

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
            check in
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}

export default QRCodeGenerator;
