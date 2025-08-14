// File: worknest/client/src/pages/ProfilePage.jsx

import React, { useState, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { updateUserProfile } from '../services/authService';
import { uploadFile } from '../services/fileService'; // Import the new file service
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { UserCircle } from 'lucide-react';

const ProfilePage = () => {
  const { currentUser } = useAuth();
  const fileInputRef = useRef(null); // Ref to access the hidden file input

  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [photoURL, setPhotoURL] = useState(currentUser?.photoURL || '');
  const [phoneNumber, setPhoneNumber] = useState(''); // Add state for new fields
  const [freelancerField, setFreelancerField] = useState(''); // Add state for new fields
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Triggers the hidden file input
  const handlePhotoClick = () => {
    fileInputRef.current.click();
  };

  // Handles the file selection and upload
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setMessage('Uploading photo...');
    try {
      const uploadResult = await uploadFile(file);
      setPhotoURL(uploadResult.url); // Update the photo URL state with the Cloudinary URL
      setMessage('Photo uploaded! Click "Save Changes" to apply.');
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
    setLoading(false);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await updateUserProfile(currentUser, { displayName, photoURL });
      // Here you would also save phoneNumber and freelancerField to your Firestore 'users' collection
      setMessage('Profile updated successfully!');
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
    setLoading(false);
  };
  
  // (Password update logic remains the same)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Profile</h1>
        <p className="text-muted-foreground">Manage your account settings and personal information.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your photo, name, and professional details.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileUpdate} className="space-y-6">
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
                <Button type="button" variant="outline" onClick={handlePhotoClick} disabled={loading}>
                  {loading ? 'Uploading...' : 'Change Photo'}
                </Button>
                <p className="text-xs text-muted-foreground mt-2">JPG, GIF or PNG. 1MB max.</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="name" className="text-sm font-medium">Full Name</label>
                <Input id="name" placeholder="Your Name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <Input id="email" type="email" value={currentUser?.email || ''} disabled />
              </div>
              <div className="grid gap-2">
                <label htmlFor="phone" className="text-sm font-medium">Phone Number</label>
                <Input id="phone" type="tel" placeholder="+1 (123) 456-7890" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <label htmlFor="field" className="text-sm font-medium">Field of Work</label>
                <Input id="field" placeholder="e.g., Web Developer, Designer" value={freelancerField} onChange={(e) => setFreelancerField(e.target.value)} />
              </div>
            </div>
            
            <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</Button>
            {message && <p className="text-sm text-muted-foreground mt-2">{message}</p>}
          </form>
        </CardContent>
      </Card>
      
      {/* (Change Password Card remains the same) */}
    </div>
  );
};

export default ProfilePage;