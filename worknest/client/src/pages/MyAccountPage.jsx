import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getUserProfileMeta, saveUserProfileMeta } from '../services/userService';
import { updateProfile } from 'firebase/auth';
import { auth } from '../services/firebase';
import {
  changeUserPassword,
  completePhoneMfaEnrollment,
  createRecaptchaVerifier,
  getEnrolledFactors,
  reauthenticateUser,
  sendPhoneMfaEnrollmentCode,
} from '../services/authService';
import toast from 'react-hot-toast';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { uploadFile } from '../services/fileService';
import { UserCircle } from 'lucide-react';

const MyAccountPage = () => {
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
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityLoading, setSecurityLoading] = useState(false);
  const [mfaPhone, setMfaPhone] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaVerificationId, setMfaVerificationId] = useState('');
  const [enrolledFactors, setEnrolledFactors] = useState([]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!currentUser) return;

      setDisplayName(currentUser.displayName || '');
      setEmail(currentUser.email || '');
      setPhotoURL(currentUser.photoURL || '');
      setEnrolledFactors(currentUser.isAnonymous ? [] : getEnrolledFactors(currentUser));

      try {
        const profileMeta = await getUserProfileMeta(currentUser.uid);
        setCompanyName(profileMeta.companyName || '');
        setAddress(profileMeta.address || '');
        setPhoneNumber(profileMeta.phoneNumber || '');
      } catch (error) {
        console.error('Error loading profile meta:', error);
      }
    };

    loadProfile();
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
    } catch (error) {
      console.error('Error saving settings:', error);
      
      // Provide specific error messages based on the error
      let errorMessage = 'Failed to save settings.';
      if (error.message) {
        if (error.message.includes('Network error')) {
          errorMessage = 'Network error. Please ensure the server is running.';
        } else if (error.message.includes('File size')) {
          errorMessage = 'File is too large. Please use a file under 1MB.';
        } else if (error.message.includes('PNG') || error.message.includes('JPG')) {
          errorMessage = 'Invalid file type. Please use JPG or PNG.';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error(errorMessage, { id: toastId });
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

  const handleChangePassword = async () => {
    if (!currentUser || currentUser.isAnonymous) {
      toast.error('Guest accounts need to sign up before changing password.');
      return;
    }

    if (!currentPassword) {
      toast.error('Enter your current password before changing to a new password.');
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setSecurityLoading(true);
    const toastId = toast.loading('Updating password...');

    try {
      await reauthenticateUser(auth.currentUser, currentUser.email, currentPassword);
      await changeUserPassword(auth.currentUser, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password changed successfully.', { id: toastId });
    } catch (error) {
      const needsRecentLogin = error?.code === 'auth/requires-recent-login';
      toast.error(needsRecentLogin
        ? 'Please log out and sign in again, then change your password.'
        : error.message || 'Could not change password.', { id: toastId });
    } finally {
      setSecurityLoading(false);
    }
  };

  const handleSendMfaCode = async () => {
    if (!currentUser || currentUser.isAnonymous) {
      toast.error('Guest accounts need to sign up before enabling two-factor authentication.');
      return;
    }

    if (!mfaPhone.trim()) {
      toast.error('Enter a phone number with country code, for example +919876543210.');
      return;
    }

    setSecurityLoading(true);
    const toastId = toast.loading('Sending two-factor code...');

    try {
      const verifier = createRecaptchaVerifier('account-mfa-recaptcha-container');
      const verificationId = await sendPhoneMfaEnrollmentCode({
        user: auth.currentUser,
        phoneNumber: mfaPhone.trim(),
        recaptchaVerifier: verifier,
      });
      setMfaVerificationId(verificationId);
      toast.success('Verification code sent.', { id: toastId });
    } catch (error) {
      const needsRecentLogin = error?.code === 'auth/requires-recent-login';
      toast.error(needsRecentLogin
        ? 'Please log out and log in again, then enable two-factor authentication.'
        : error.message || 'Could not send two-factor code.', { id: toastId });
    } finally {
      setSecurityLoading(false);
    }
  };

  const handleVerifyMfaEnrollment = async () => {
    if (!mfaVerificationId || !mfaCode.trim()) {
      toast.error('Enter the verification code first.');
      return;
    }

    setSecurityLoading(true);
    const toastId = toast.loading('Enabling two-factor authentication...');

    try {
      await completePhoneMfaEnrollment({
        user: auth.currentUser,
        verificationId: mfaVerificationId,
        code: mfaCode.trim(),
        displayName: mfaPhone.trim(),
      });
      setMfaCode('');
      setMfaVerificationId('');
      setEnrolledFactors(getEnrolledFactors(auth.currentUser));
      toast.success('Two-factor authentication enabled.', { id: toastId });
    } catch (error) {
      toast.error(error.message || 'Could not enable two-factor authentication.', { id: toastId });
    } finally {
      setSecurityLoading(false);
    }
  };

  return (
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
                accept="image/png, image/jpeg"
              />
              <Button type="button" variant="outline" onClick={() => fileInputRef.current.click()} disabled={loading}>
                {loading ? 'Uploading...' : 'Change Photo'}
              </Button>
              <p className="text-xs text-muted-foreground mt-2">JPG or PNG. 1MB max.</p>
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
          <CardTitle>Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-base font-semibold">Change Password</h3>
            <div className="grid gap-3">
              <div className="space-y-2">
                <label htmlFor="currentPassword">Current Password</label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  disabled={currentUser?.isAnonymous || securityLoading}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="newPassword">New Password</label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  disabled={currentUser?.isAnonymous || securityLoading}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  disabled={currentUser?.isAnonymous || securityLoading}
                />
              </div>
            </div>
            <Button onClick={handleChangePassword} disabled={currentUser?.isAnonymous || securityLoading}>
              Change Password
            </Button>
          </div>

          <div className="space-y-3 border-t border-slate-200 pt-5">
            <div>
              <h3 className="text-base font-semibold">Two-Factor Authentication</h3>
              <p className="text-sm text-muted-foreground">
                {enrolledFactors.length > 0
                  ? 'Phone two-factor authentication is enabled for this account.'
                  : 'Add SMS verification as a second step when logging in.'}
              </p>
            </div>
            <div id="account-mfa-recaptcha-container" />
            <div className="grid gap-3 md:grid-cols-[1fr_auto]">
              <Input
                placeholder="+919876543210"
                value={mfaPhone}
                onChange={(event) => setMfaPhone(event.target.value)}
                disabled={currentUser?.isAnonymous || securityLoading || enrolledFactors.length > 0}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleSendMfaCode}
                disabled={currentUser?.isAnonymous || securityLoading || enrolledFactors.length > 0}
              >
                Send Code
              </Button>
            </div>
            {mfaVerificationId ? (
              <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                <Input
                  placeholder="Enter verification code"
                  value={mfaCode}
                  onChange={(event) => setMfaCode(event.target.value)}
                  disabled={securityLoading}
                />
                <Button type="button" onClick={handleVerifyMfaEnrollment} disabled={securityLoading}>
                  Enable 2FA
                </Button>
              </div>
            ) : null}
            {currentUser?.isAnonymous ? (
              <p className="text-sm text-muted-foreground">Guest accounts need to sign up before security settings are available.</p>
            ) : null}
          </div>
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
  );
};

export default MyAccountPage;
