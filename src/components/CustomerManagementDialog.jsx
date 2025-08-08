import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  TextField,
  Box,
  Typography,
  Divider,
  Alert,
  Tooltip,
  InputAdornment,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import PeopleIcon from '@mui/icons-material/People';
import SearchIcon from '@mui/icons-material/Search';
import { updateCustomer, deleteCustomer } from '../services/firebaseService';

const CustomerManagementDialog = ({ open, onClose, customers }) => {
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter customers based on search query
  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.notes?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (customer) => {
    setEditingCustomer(customer.id);
    setEditName(customer.name || '');
    setEditEmail(customer.email || '');
    setEditNotes(customer.notes || '');
    setError('');
    setSuccess('');
  };

  const handleCancelEdit = () => {
    setEditingCustomer(null);
    setEditName('');
    setEditEmail('');
    setEditNotes('');
    setError('');
    setSuccess('');
  };

  const handleSave = async () => {
    if (!editName.trim()) {
      setError('Customer name is required');
      return;
    }

    try {
      await updateCustomer(editingCustomer, {
        name: editName.trim(),
        email: editEmail.trim() || null,
        notes: editNotes.trim() || null,
      });
      setSuccess('Customer updated successfully');
      setEditingCustomer(null);
      setEditName('');
      setEditEmail('');
      setEditNotes('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to update customer');
      console.error('Error updating customer:', error);
    }
  };

  const handleDelete = async (customerId, customerName) => {
    if (
      window.confirm(
        `Are you sure you want to delete customer "${customerName}"?`
      )
    ) {
      try {
        await deleteCustomer(customerId);
        setSuccess('Customer deleted successfully');
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        setError('Failed to delete customer');
        console.error('Error deleting customer:', error);
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle
        sx={{
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          alignItems: 'center',
        }}>
        <PeopleIcon sx={{ mr: 1, color: 'primary.main' }} />
        CUSTOMER MANAGEMENT
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {error && (
          <Alert severity='error' sx={{ m: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity='success' sx={{ m: 2 }}>
            {success}
          </Alert>
        )}

        {/* Search Input */}
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
          <TextField
            fullWidth
            placeholder='Search customers by name, email, or notes...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 0,
              },
            }}
          />
        </Box>

        {filteredCustomers.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant='body1' color='text.secondary'>
              {searchQuery
                ? 'No customers found matching your search'
                : 'No customers found'}
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {filteredCustomers.map((customer, index) => (
              <React.Fragment key={customer.id}>
                <ListItem sx={{ px: 3, py: 2 }}>
                  {editingCustomer === customer.id ? (
                    <Box sx={{ width: '100%' }}>
                      <Box
                        sx={{
                          display: 'flex',
                          gap: 2,
                          alignItems: 'center',
                        }}>
                        <Box sx={{ flex: 1 }}>
                          <TextField
                            fullWidth
                            label='Customer Name'
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            sx={{ mb: 2 }}
                            size='small'
                          />
                          <TextField
                            fullWidth
                            label='Email Address'
                            value={editEmail}
                            onChange={(e) => setEditEmail(e.target.value)}
                            sx={{ mb: 2 }}
                            size='small'
                          />
                          <TextField
                            fullWidth
                            label='Notes'
                            value={editNotes}
                            onChange={(e) => setEditNotes(e.target.value)}
                            multiline
                            rows={3}
                            size='small'
                            placeholder='Add notes about this customer...'
                          />
                        </Box>
                        <Box
                          sx={{
                            display: 'flex',
                            gap: 1,
                            ml: 2,
                            flexShrink: 0,
                          }}>
                          <Tooltip title='Save Changes'>
                            <IconButton
                              onClick={handleSave}
                              color='primary'
                              size='small'>
                              <SaveIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title='Cancel'>
                            <IconButton
                              onClick={handleCancelEdit}
                              color='default'
                              size='small'>
                              <CancelIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    </Box>
                  ) : (
                    <Box sx={{ flex: 1 }}>
                      <Typography variant='body1' fontWeight={500}>
                        {customer.name}
                      </Typography>
                      <Typography variant='body2' color='text.secondary'>
                        {customer.email || 'No email provided'}
                      </Typography>
                      {customer.notes && (
                        <Typography
                          variant='body2'
                          sx={{
                            mt: 1,
                            color: '#666666',
                            fontFamily: '"Inter", sans-serif',
                            fontSize: '0.8rem',
                            fontStyle: 'italic',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            opacity: 0.8,
                          }}>
                          {customer.notes}
                        </Typography>
                      )}
                    </Box>
                  )}

                  {editingCustomer !== customer.id && (
                    <ListItemSecondaryAction>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title='Edit Customer'>
                          <IconButton
                            onClick={() => handleEdit(customer)}
                            color='primary'
                            size='small'>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title='Delete Customer'>
                          <IconButton
                            onClick={() =>
                              handleDelete(customer.id, customer.name)
                            }
                            color='error'
                            size='small'>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </ListItemSecondaryAction>
                  )}
                </ListItem>
                {index < filteredCustomers.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
        <Button
          onClick={onClose}
          sx={{
            color: 'text.primary',
            '&:hover': {
              backgroundColor: 'transparent',
              color: 'text.secondary',
            },
          }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomerManagementDialog;
