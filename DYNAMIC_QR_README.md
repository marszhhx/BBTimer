# Dynamic QR Code Security Feature

## Overview

The BB Timer application now includes a dynamic QR code system that prevents users from checking in before they arrive at the business location. This security feature ensures that customers can only check in when they are physically present and have scanned the current QR code.

## Security Fix (Latest Update)

### Problem Identified

Previously, both old QR codes (without timestamps) and new dynamic QR codes (with timestamps) could be used for check-in, which defeated the security purpose. Additionally, the system was allowing QR codes from both the current and previous 5-minute windows.

### Solution Implemented

- **Strict Timestamp Validation**: Only QR codes with valid timestamps are accepted
- **Exact Time Window Match**: Only the current 5-minute window timestamp is accepted (no tolerance)
- **Complete State Reset**: When timestamp validation fails, all user state is cleared
- **Enhanced Error Handling**: Better validation for missing or invalid timestamp parameters
- **Form Disable Logic**: Check-in form is completely disabled until valid QR code is scanned

### Validation Logic

```javascript
// 严格验证：必须有时间戳参数
if (!timestamp || timestamp === '') {
  setTimestampError(
    'Invalid QR code. Please scan the current QR code from the business location.'
  );
  setTimestampValid(false);
  return false;
}

// 验证时间戳是否为有效数字
const qrTimestamp = parseInt(timestamp);
if (isNaN(qrTimestamp)) {
  setTimestampError(
    'Invalid QR code format. Please scan the current QR code from the business location.'
  );
  setTimestampValid(false);
  return false;
}

// 严格验证：只允许当前时间窗口的QR码
if (qrTimestamp === currentTimestamp) {
  setTimestampValid(true);
  setTimestampError('');
  return true;
} else {
  setTimestampError(
    'QR code has expired. Please scan the current QR code from the business location.'
  );
  setTimestampValid(false);
  return false;
}
```

## How It Works

### 1. Dynamic QR Code Generation

- QR codes are generated with a timestamp that updates every 5 minutes
- Each QR code contains a unique timestamp parameter: `/checkin?t=123456789`
- The timestamp is calculated as: `Math.floor(Date.now() / (5 * 60 * 1000))`

### 2. QR Code Validation

- When users access the check-in page, the system validates the timestamp
- Only QR codes with current or previous 5-minute window timestamps are accepted
- Expired QR codes (older than 10 minutes) are rejected
- **NEW**: QR codes without timestamps are completely rejected

### 3. Security Benefits

- **Prevents Early Check-ins**: Users cannot check in from home or while in line
- **Time-based Access**: QR codes automatically expire every 5 minutes
- **Location Verification**: Users must be physically present to scan the current QR code
- **Complete Security**: Old QR codes without timestamps are no longer functional
- **Exact Time Window**: Only the current 5-minute window QR codes are accepted (no tolerance for previous windows)

## Technical Implementation

### QR Code Generator (`QRCodeGenerator.jsx`)

```javascript
// QR码更新间隔 (5分钟)
const QR_UPDATE_INTERVAL = 5 * 60 * 1000;

// 生成时间戳 (每5分钟更新一次)
const generateTimestamp = () => {
  return Math.floor(Date.now() / QR_UPDATE_INTERVAL);
};

// 生成带时间戳的URL
const checkInUrl = `${currentUrl}/checkin?t=${timestamp}`;
```

### Check-in Validation (`SelfServicePortal.jsx`)

```javascript
// 验证时间戳
const validateTimestamp = () => {
  const timestamp = searchParams.get('t');
  const currentTimestamp = Math.floor(Date.now() / QR_UPDATE_INTERVAL);
  const qrTimestamp = parseInt(timestamp);

  // 允许1个时间窗口的容差
  if (qrTimestamp >= currentTimestamp - 1 && qrTimestamp <= currentTimestamp) {
    return true;
  } else {
    return false;
  }
};
```

## User Experience

### For Customers

1. **Scan Current QR Code**: Must scan the QR code displayed at the business location
2. **Immediate Access**: Valid QR codes allow immediate check-in
3. **Clear Error Messages**: Expired QR codes show clear error messages
4. **No Confusion**: Form is disabled until valid QR code is scanned

### For Administrators

1. **Automatic Updates**: QR codes update every 5 minutes automatically
2. **Visual Indicators**: Shows current timestamp and next update time
3. **Manual Refresh**: Option to manually refresh QR code if needed
4. **Download Feature**: Can download current QR code for printing

## Configuration

### Update Interval

The QR code update interval can be modified by changing the `QR_UPDATE_INTERVAL` constant:

```javascript
// 当前设置: 5分钟
const QR_UPDATE_INTERVAL = 5 * 60 * 1000;

// 可以调整为其他间隔:
// 3分钟: 3 * 60 * 1000
// 10分钟: 10 * 60 * 1000
```

### Timestamp Tolerance

The system allows a 1-window tolerance (current + previous window) to account for:

- Network delays
- Clock synchronization issues
- User scanning timing

## Testing

### Test Information Display

The QR Code Generator page includes a test information section showing:

- Current timestamp
- Generated check-in URL
- Next update time

### Manual Testing

1. Generate a QR code
2. Scan with a mobile device
3. Verify check-in page loads correctly
4. Wait for QR code to expire (5 minutes)
5. Try to access the expired URL
6. Verify error message appears

## Security Considerations

### Advantages

- ✅ Prevents early check-ins
- ✅ Time-based access control
- ✅ No additional hardware required
- ✅ User-friendly implementation

### Limitations

- ⚠️ Requires users to have mobile devices
- ⚠️ Depends on accurate system clocks
- ⚠️ QR codes can be photographed (but expire quickly)

### Recommendations

- Keep QR codes in secure locations
- Monitor for unusual check-in patterns
- Consider combining with location verification for enhanced security

## Troubleshooting

### Common Issues

1. **QR Code Not Working**

   - Check if QR code has expired
   - Verify timestamp validation logic
   - Ensure URL format is correct

2. **Users Cannot Check In**

   - Verify QR code is current
   - Check browser console for errors
   - Ensure timestamp tolerance is appropriate

3. **QR Code Updates Too Frequently**
   - Adjust `QR_UPDATE_INTERVAL` to a longer duration
   - Consider business needs and user experience

### Debug Information

Enable console logging to debug timestamp validation:

```javascript
console.log('Current timestamp:', currentTimestamp);
console.log('QR timestamp:', qrTimestamp);
console.log('Check-in URL:', checkInUrl);
```

## Future Enhancements

### Potential Improvements

1. **Location Verification**: Add GPS-based location checking
2. **Business Hours**: Restrict check-ins to business hours only
3. **Admin Controls**: Allow administrators to enable/disable QR codes
4. **Analytics**: Track QR code usage and validation attempts
5. **Multiple QR Codes**: Support different QR codes for different services

### Integration Possibilities

- **WiFi Network Detection**: Verify user is on business WiFi
- **Bluetooth Beacons**: Use proximity-based verification
- **NFC Tags**: Alternative to QR codes for mobile devices
- **Biometric Verification**: Add fingerprint or face recognition

---

This dynamic QR code system provides a robust security layer while maintaining a smooth user experience for legitimate customers.
