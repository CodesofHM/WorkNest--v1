import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { saveUserProfileMeta } from '../services/userService';
import { updateProfile } from 'firebase/auth';
import { auth } from '../services/firebase';
import toast from 'react-hot-toast';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { useNavigate } from 'react-router-dom';
import { uploadFile } from '../services/fileService';
import { UserCircle } from 'lucide-react';
import Modal from './ui/Modal';

const ProfileModal = ({ isOpen, onClose }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setDisplayName(currentUser.displayName || '');
      setEmail(currentUser.email || '');
      setPhotoURL(currentUser.photoURL || '');
      // You might want to fetch and set companyName, address and phoneNumber from your database here
    }
  }, [currentUser]);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setPhotoFile(e.target.files[0]);
      setPhotoURL(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSave = async () => {
    if (!currentUser) return;

    setLoading(true);
    const toastId = toast.loading('Saving settings...');
    let newPhotoURL = photoURL;

    try {
      if (photoFile) {
        const uploadResult = await uploadFile(photoFile);
        newPhotoURL = uploadResult.url;
      }

      // Update Firebase Auth profile
      await updateProfile(auth.currentUser, {
        displayName: displayName,
        photoURL: newPhotoURL,
      });

      // Save additional metadata to Firestore
      await saveUserProfileMeta(currentUser.uid, {
        companyName,
        address,
        phoneNumber,
        photoURL: newPhotoURL,
      });

      toast.success('Settings saved successfully!', { id: toastId });
      onClose();
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error('Failed to save settings.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Account</h1>
          <p className="text-muted-foreground">Manage your account settings.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              {photoURL ? (
                <img src={photoURL} alt="Profile" className="h-20 w-20 rounded-full object-cover" />
              ) : (
                <UserCircle className="h-20 w-20 text-muted-foreground" />
              )}
              <div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept="image/png, image/jpeg, image/gif"
                />
                <Button type="button" variant="outline" onClick={() => fileInputRef.current.click()} disabled={loading}>
                  {loading ? 'Uploading...' : 'Change Photo'}
                </Button>
                <p className="text-xs text-muted-foreground mt-2">JPG, GIF or PNG. 1MB max.</p>
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="displayName">Display Name</label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email">Email</label>
              <Input
                id="email"
                type="email"
                value={email}
                disabled // Email is not editable directly
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="companyName">Company Name</label>
              <Input
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="address">Address</label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="phoneNumber">Phone Number</label>
              <Input
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Logout</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={handleLogout}>Logout</Button>
          </CardContent>
        </Card>
      </div>
    </Modal>
  );
};

export default ProfileModal;
