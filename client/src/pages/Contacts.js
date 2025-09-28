import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { 
  FiUsers, 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiStar, 
  FiPhone, 
  FiMail,
  FiUser,
  FiSearch,
  FiFilter
} from 'react-icons/fi';
import axios from '../utils/axios';  
import toast from 'react-hot-toast';
import ContactModal from '../components/ContactModal';
import ConfirmationDialog from '../components/ConfirmationDialog';

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRelationship, setFilterRelationship] = useState('all');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [contactToDelete, setContactToDelete] = useState(null);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/contacts');
      
      if (response.data.success) {
        setContacts(response.data.data.contacts);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
      toast.error('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = () => {
    setEditingContact(null);
    setShowModal(true);
  };

  const handleEditContact = (contact) => {
    setEditingContact(contact);
    setShowModal(true);
  };

  const handleDeleteContact = (contact) => {
    setContactToDelete(contact);
    setShowDeleteDialog(true);
  };

  const confirmDeleteContact = async () => {
    if (!contactToDelete) return;

    try {
      const response = await axios.delete(`/api/contacts/${contactToDelete._id}`);
      
      if (response.data.success) {
        toast.success('Contact deleted successfully');
        loadContacts();
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast.error('Failed to delete contact');
    } finally {
      setShowDeleteDialog(false);
      setContactToDelete(null);
    }
  };

  const cancelDeleteContact = () => {
    setShowDeleteDialog(false);
    setContactToDelete(null);
  };

  const handleSetPrimary = async (contactId) => {
    try {
      const response = await axios.put(`/api/contacts/${contactId}/primary`);
      
      if (response.data.success) {
        toast.success('Primary contact updated');
        loadContacts();
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Error setting primary contact:', error);
      toast.error('Failed to update primary contact');
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingContact(null);
  };

  const handleModalSave = () => {
    loadContacts();
    handleModalClose();
  };

  // Filter contacts based on search and relationship
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.phone.includes(searchTerm) ||
                         (contact.email && contact.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRelationship = filterRelationship === 'all' || contact.relationship === filterRelationship;
    
    return matchesSearch && matchesRelationship;
  });

  const relationshipOptions = [
    { value: 'all', label: 'All Relationships' },
    { value: 'family', label: 'Family' },
    { value: 'friend', label: 'Friend' },
    { value: 'colleague', label: 'Colleague' },
    { value: 'neighbor', label: 'Neighbor' },
    { value: 'other', label: 'Other' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading contacts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Trusted Contacts - Navi Shakti</title>
        <meta name="description" content="Manage your trusted contacts for emergency notifications." />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 font-display">
                Trusted Contacts
              </h1>
              <p className="text-gray-600 mt-2">
                Manage the people who will be notified during emergencies
              </p>
            </div>
            <button
              onClick={handleAddContact}
              className="btn-primary flex items-center space-x-2"
            >
              <FiPlus className="w-5 h-5" />
              <span>Add Contact</span>
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiFilter className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={filterRelationship}
                onChange={(e) => setFilterRelationship(e.target.value)}
                className="input-field pl-10 pr-8"
              >
                {relationshipOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Contacts Grid */}
        {filteredContacts.length === 0 ? (
          <div className="text-center py-12">
            <FiUsers className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm || filterRelationship !== 'all' ? 'No contacts found' : 'No contacts yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterRelationship !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Add your first trusted contact to get started'
              }
            </p>
            {!searchTerm && filterRelationship === 'all' && (
              <button
                onClick={handleAddContact}
                className="btn-primary"
              >
                Add Your First Contact
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContacts.map((contact, index) => (
              <motion.div
                key={contact._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card hover:shadow-lg transition-shadow duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <FiUser className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 flex items-center">
                        {contact.name}
                        {contact.isPrimary && (
                          <FiStar className="w-4 h-4 text-yellow-500 ml-2" />
                        )}
                      </h3>
                      <span className="text-sm text-gray-500 capitalize">
                        {contact.relationship}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleEditContact(contact)}
                      className="p-2 text-gray-400 hover:text-primary-600 transition-colors duration-200"
                      title="Edit contact"
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteContact(contact)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors duration-200"
                      title="Delete contact"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <FiPhone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{contact.phone}</span>
                  </div>
                  
                  {contact.email && (
                    <div className="flex items-center space-x-3">
                      <FiMail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{contact.email}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {contact.isPrimary ? 'Primary Contact' : 'Trusted Contact'}
                    </span>
                    {!contact.isPrimary && (
                      <button
                        onClick={() => handleSetPrimary(contact._id)}
                        className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                      >
                        Set as Primary
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Stats */}
        {contacts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <div className="card text-center">
              <div className="text-2xl font-bold text-gray-900">{contacts.length}</div>
              <div className="text-sm text-gray-600">Total Contacts</div>
            </div>
            <div className="card text-center">
              <div className="text-2xl font-bold text-gray-900">
                {contacts.filter(c => c.isPrimary).length}
              </div>
              <div className="text-sm text-gray-600">Primary Contacts</div>
            </div>
            <div className="card text-center">
              <div className="text-2xl font-bold text-gray-900">
                {contacts.filter(c => c.email).length}
              </div>
              <div className="text-sm text-gray-600">With Email</div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Contact Modal */}
      {showModal && (
        <ContactModal
          contact={editingContact}
          onClose={handleModalClose}
          onSave={handleModalSave}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={cancelDeleteContact}
        onConfirm={confirmDeleteContact}
        title="Delete Contact"
        message={`Are you sure you want to delete "${contactToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default Contacts;
