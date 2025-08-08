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
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        justifyContent: 'center',
        backgroundColor: '#fafafa',
      }}>
      <Container
        maxWidth='sm'
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pt: { xs: 2, sm: 4, md: 6 },
        }}>
        <Paper
          elevation={0}
          sx={{
            p: isMobile ? 3 : 4,
            width: '100%',
            maxWidth: 500,
            border: '1px solid #e0e0e0',
            borderRadius: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: '#ffffff',
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
            Check In Here
          </Typography>

          <Typography
            variant='body1'
            sx={{
              textAlign: 'center',
              color: 'text.secondary',
              mb: 4,
            }}>
            Scan the QR code with your phone camera
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
                  width: '100%',
                }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    border: '2px solid #e0e0e0',
                    p: 4,
                    borderRadius: 1,
                    width: 'fit-content',
                    margin: '0 auto',
                    backgroundColor: '#ffffff',
                    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.05)',
                  }}>
                  <img
                    src={qrCodeDataUrl}
                    alt='QR Code for Check-in'
                    style={{
                      width: '300px',
                      height: '300px',
                      maxWidth: '100%',
                      display: 'block',
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
        </Paper>
      </Container>
    </Box>
  );
}

export default QRCodeGenerator;
