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
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import PeopleIcon from '@mui/icons-material/People';
import { updateCustomer, deleteCustomer } from '../services/firebaseService';

const CustomerManagementDialog = ({ open, onClose, customers }) => {
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleEdit = (customer) => {
    setEditingCustomer(customer.id);
    setEditName(customer.name || '');
    setEditEmail(customer.email || '');
    setError('');
    setSuccess('');
  };

  const handleCancelEdit = () => {
    setEditingCustomer(null);
    setEditName('');
    setEditEmail('');
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
      });
      setSuccess('Customer updated successfully');
      setEditingCustomer(null);
      setEditName('');
      setEditEmail('');
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

        {customers.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant='body1' color='text.secondary'>
              No customers found
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {customers.map((customer, index) => (
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
                            size='small'
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
                    <ListItemText
                      primary={customer.name}
                      secondary={customer.email || 'No email provided'}
                      primaryTypographyProps={{
                        variant: 'body1',
                        fontWeight: 500,
                      }}
                      secondaryTypographyProps={{
                        variant: 'body2',
                        color: 'text.secondary',
                      }}
                    />
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
                {index < customers.length - 1 && <Divider />}
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
