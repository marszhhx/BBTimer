# Check-in Lottery Feature

## Overview

The Check-in Lottery feature allows administrators to fairly distribute items among currently checked-in customers using a random lottery system. This feature ensures equitable distribution while adding an element of excitement for customers.

## How It Works

### 1. Fair Distribution Algorithm

- **Base Distribution**: Items are distributed as evenly as possible among all checked-in customers
- **Remaining Items**: If items cannot be divided evenly, extra items are randomly assigned to lucky customers
- **Random Selection**: Uses a fair random algorithm to select who gets extra items

### 2. Distribution Rules

- Items are distributed as evenly as possible
- If items cannot be divided evenly, extra items will be randomly assigned
- Results are temporary and will not be saved
- Only currently checked-in customers are eligible

### 3. User Interface

- **Lottery Button**: Located in the bottom-right corner of the admin dashboard
- **Disabled State**: Button is disabled when no customers are checked in
- **Dialog Interface**: Clean, intuitive dialog for setting up and viewing results

## Features

### 🎲 **Lottery Setup**

- Enter the number of items to distribute
- View current check-in count
- Clear distribution rules explanation
- Input validation and error handling

### 🎯 **Fair Distribution**

- Automatic calculation of base items per person
- Random assignment of extra items
- Visual indicators for lucky winners
- Detailed distribution summary

### 🏆 **Results Display**

- Individual customer results with item counts
- Lucky winner indicators
- Distribution summary statistics
- Option to start a new lottery

## Usage Instructions

### For Administrators

1. **Access Lottery**

   - Click the casino icon (🎰) in the bottom-right corner of the admin dashboard
   - Button is only enabled when customers are checked in

2. **Set Up Lottery**

   - Enter the number of items to distribute
   - Review the current check-in count
   - Click "Draw Lottery" to start

3. **View Results**

   - Watch the drawing animation (2 seconds)
   - Review individual customer results
   - See who got extra items (marked as "Lucky!")
   - View distribution summary

4. **Next Steps**
   - Click "New Lottery" to start another round
   - Click "Close" to exit the lottery dialog

### Example Scenarios

#### Scenario 1: Even Distribution

- **Items**: 10
- **Customers**: 5
- **Result**: Each customer gets 2 items

#### Scenario 2: Uneven Distribution

- **Items**: 7
- **Customers**: 3
- **Result**:
  - Base: 2 items each (6 total)
  - Extra: 1 item randomly assigned
  - Final: 2 customers get 2 items, 1 customer gets 3 items

#### Scenario 3: More Items Than Customers

- **Items**: 15
- **Customers**: 4
- **Result**:
  - Base: 3 items each (12 total)
  - Extra: 3 items randomly assigned
  - Final: 1 customer gets 3 items, 3 customers get 4 items

## Technical Implementation

### Components

- **LotteryDialog.jsx**: Main lottery interface component
- **AdminDashboard.jsx**: Integration with admin dashboard

### Key Functions

```javascript
// Calculate distribution
const calculateDistribution = (items, customers) => {
  const baseItemsPerPerson = Math.floor(items / customers.length);
  const remainingItems = items % customers.length;

  // Create base distribution
  const distribution = customers.map((customer) => ({
    customer,
    items: baseItemsPerPerson,
  }));

  // Randomly assign extra items
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
```

### State Management

- **itemCount**: Number of items to distribute
- **isDrawing**: Drawing animation state
- **lotteryResults**: Distribution results
- **error**: Error messages

## User Experience

### Visual Design

- **Consistent Styling**: Matches the overall application design
- **Clear Indicators**: Lucky winners are highlighted
- **Responsive Layout**: Works on mobile and desktop
- **Smooth Animations**: Drawing animation for engagement

### Accessibility

- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Friendly**: Proper ARIA labels
- **High Contrast**: Clear visual hierarchy
- **Mobile Optimized**: Touch-friendly interface

## Security & Fairness

### Random Algorithm

- Uses JavaScript's built-in `Math.random()` for fairness
- Shuffles customer array before assigning extra items
- No bias towards any specific customer

### Data Privacy

- Results are not saved to database
- No permanent record of lottery outcomes
- Temporary display only

### Validation

- Input validation for item count
- Checks for minimum customer count
- Error handling for edge cases

## Future Enhancements

### Potential Improvements

1. **Custom Item Types**: Support for different item categories
2. **Weighted Lottery**: Assign different probabilities to customers
3. **Lottery History**: Temporary history of recent lotteries
4. **Export Results**: Option to export results as PDF/image
5. **Multiple Rounds**: Support for multiple lottery rounds

### Integration Possibilities

- **Customer Notifications**: Notify customers of lottery results
- **Analytics**: Track lottery participation and fairness
- **Custom Rules**: Allow custom distribution rules
- **Scheduled Lotteries**: Automatic lottery at specific times

## Troubleshooting

### Common Issues

1. **Lottery Button Disabled**

   - Ensure customers are checked in
   - Check if activeCheckIns data is loading correctly

2. **No Results Displayed**

   - Verify item count is a valid number
   - Check browser console for errors
   - Ensure customer data is available

3. **Uneven Distribution**
   - This is expected behavior for uneven divisions
   - Extra items are randomly assigned
   - Check the distribution summary for details

### Debug Information

Enable console logging to debug lottery functionality:

```javascript
console.log('Active customers:', activeCustomers);
console.log('Item count:', itemCount);
console.log('Distribution results:', lotteryResults);
```

---

The Check-in Lottery feature provides a fair and engaging way to distribute items among customers while maintaining transparency and excitement in the process.
