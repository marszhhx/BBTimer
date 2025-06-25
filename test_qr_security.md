# QR Code Security Test Guide

## Security Update (Latest)

### Previous Issue

The system was allowing QR codes from both the current and previous 5-minute windows, which meant old QR codes could still be used.

### Current Fix

- **Strict Timestamp Validation**: Only QR codes with the exact current timestamp are accepted
- **No Tolerance**: Previous time windows are no longer accepted
- **Real-time Validation**: QR codes become invalid immediately when the time window changes

### Validation Logic

```javascript
// 严格验证：只允许当前时间窗口的QR码
if (qrTimestamp === currentTimestamp) {
  return true; // Valid
} else {
  return false; // Invalid
}
```

## Test Scenarios

### ✅ **Test 1: Valid Current QR Code**

**URL:** `/checkin?t=[current_timestamp]`
**Expected Result:**

- ✅ Form is enabled
- ✅ User can enter information
- ✅ Check-in process works normally
- ✅ No error messages

### ❌ **Test 2: No Timestamp (Old QR Code)**

**URL:** `/checkin`
**Expected Result:**

- ❌ Form is disabled
- ❌ Error message: "Invalid QR code. Please scan the current QR code from the business location."
- ❌ User cannot enter information
- ❌ Check-in button shows "QR Code Required"

### ❌ **Test 3: Previous Time Window (Now Invalid)**

**URL:** `/checkin?t=[previous_timestamp]`
**Expected Result:**

- ❌ Form is disabled
- ❌ Error message: "QR code has expired. Please scan the current QR code from the business location."
- ❌ User cannot enter information
- ❌ Check-in button shows "QR Code Required"

### ❌ **Test 4: Invalid Timestamp Format**

**URL:** `/checkin?t=invalid`
**Expected Result:**

- ❌ Form is disabled
- ❌ Error message: "Invalid QR code format. Please scan the current QR code from the business location."
- ❌ User cannot enter information
- ❌ Check-in button shows "QR Code Required"

### ❌ **Test 5: Empty Timestamp**

**URL:** `/checkin?t=`
**Expected Result:**

- ❌ Form is disabled
- ❌ Error message: "Invalid QR code. Please scan the current QR code from the business location."
- ❌ User cannot enter information
- ❌ Check-in button shows "QR Code Required"

## How to Test

### Step 1: Generate Current QR Code

1. Go to `/qr` page
2. Note the current timestamp from the debug information
3. Copy the generated check-in URL

### Step 2: Test Valid QR Code

1. Open the current check-in URL in a new tab
2. Verify form is enabled
3. Try to enter information
4. Verify check-in process works

### Step 3: Test Invalid QR Codes

1. Try accessing `/checkin` (no timestamp)
2. Try accessing `/checkin?t=[previous_timestamp]` (previous time window)
3. Try accessing `/checkin?t=invalid` (invalid format)
4. Try accessing `/checkin?t=` (empty timestamp)

### Step 4: Test Time Window Expiry

1. Generate a QR code and note the timestamp
2. Wait for the 5-minute window to expire
3. Try to use the old QR code
4. Verify it's rejected

### Step 5: Verify Security

- All invalid URLs should show error messages
- Forms should be disabled
- No check-in should be possible
- Only the exact current timestamp should work

## Console Debug Information

When testing, check the browser console for detailed debug information:

### QR Code Generation:

```
=== QR Code Generation Debug ===
Current time (ms): 1703123456789
QR_UPDATE_INTERVAL (ms): 300000
Generated timestamp: 5677078
Check-in URL: http://localhost:5173/checkin?t=5677078
Next update time: 12/21/2023, 2:30:00 PM
================================
```

### Timestamp Validation:

```
=== Timestamp Validation Debug ===
Current time (ms): 1703123456789
QR_UPDATE_INTERVAL (ms): 300000
Current timestamp: 5677078
QR timestamp: 5677078
Timestamp difference: 0
Validation result: true
==================================
```

## Expected Console Output

### Valid QR Code (Current Timestamp):

```
Current timestamp: 5677078
QR timestamp: 5677078
Timestamp difference: 0
Validation result: true
```

### Invalid QR Code (Previous Timestamp):

```
Current timestamp: 5677078
QR timestamp: 5677077
Timestamp difference: 1
Validation result: false
```

### Invalid QR Code (No Timestamp):

```
Current timestamp: 5677078
QR timestamp: NaN
Timestamp difference: NaN
Validation result: false
```

## Security Verification Checklist

- [ ] Old QR codes without timestamps are rejected
- [ ] Previous time window QR codes are rejected
- [ ] Invalid timestamp formats are rejected
- [ ] Empty timestamps are rejected
- [ ] Form is disabled for invalid QR codes
- [ ] Clear error messages are displayed
- [ ] User state is cleared for invalid QR codes
- [ ] Only current timestamp QR codes work
- [ ] Check-in process is blocked for invalid QR codes
- [ ] QR codes expire immediately when time window changes

## Time Window Calculation

The timestamp is calculated as:

```javascript
const timestamp = Math.floor(Date.now() / (5 * 60 * 1000));
```

This means:

- Every 5 minutes, the timestamp increments by 1
- QR codes are only valid for the exact 5-minute window they were generated in
- No tolerance is allowed for previous or future time windows

## Troubleshooting

### If Previous Timestamps Still Work:

1. Check if the validation logic is being called
2. Verify the `timestampValid` state is being set correctly
3. Ensure the strict equality check is working
4. Check browser console for validation errors

### If Error Messages Don't Appear:

1. Verify the `timestampError` state is being set
2. Check if the Alert component is rendering
3. Ensure the error message logic is correct

### If Form is Not Disabled:

1. Check the `disabled` prop on form fields
2. Verify the `timestampValid` state is false for invalid QR codes
3. Ensure the conditional rendering is working correctly

### If Timestamps Don't Match:

1. Check if both client and server are using the same time
2. Verify the `QR_UPDATE_INTERVAL` is consistent
3. Check for any timezone issues
