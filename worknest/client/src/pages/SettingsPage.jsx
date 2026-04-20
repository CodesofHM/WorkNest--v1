import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { uploadFile } from '../services/fileService';
import { getUserProfileMeta, saveUserProfileMeta, saveUserSettings } from '../services/userService';
import { disconnectWhatsAppConnection, getWhatsAppConnectionStatus, saveWhatsAppConnection } from '../services/whatsappService';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';

const SettingsPage = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [settings, setSettings] = useState({
    companyName: '',
    companyAddress: '',
    primaryColor: '#111827',
    secondaryColor: '#f3f4f6',
    proposalFooter: 'Thank you for the opportunity to work together.',
    logoUrl: '',
  });
  const [whatsAppConnection, setWhatsAppConnection] = useState({
    businessName: '',
    phoneNumberId: '',
    accessToken: '',
    connected: false,
    phoneNumberIdPreview: '',
  });

  useEffect(() => {
    const loadSettings = async () => {
      if (!currentUser) return;

      try {
        const profileMeta = await getUserProfileMeta(currentUser.uid);
        const whatsappStatus = await getWhatsAppConnectionStatus();
        setSettings((prev) => ({
          ...prev,
          companyName: profileMeta.companyName || prev.companyName,
          companyAddress: profileMeta.address || prev.companyAddress,
          primaryColor: profileMeta.settings?.primaryColor || prev.primaryColor,
          secondaryColor: profileMeta.settings?.secondaryColor || prev.secondaryColor,
          proposalFooter: profileMeta.settings?.proposalFooter || prev.proposalFooter,
          logoUrl: profileMeta.settings?.logoUrl || profileMeta.photoURL || '',
        }));
        setWhatsAppConnection((prev) => ({
          ...prev,
          connected: whatsappStatus.connected || false,
          businessName: whatsappStatus.businessName || '',
          phoneNumberIdPreview: whatsappStatus.phoneNumberIdPreview || '',
        }));
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    loadSettings();
  }, [currentUser]);

  const handleSave = async () => {
    if (!currentUser) return;

    const toastId = toast.loading('Saving settings...');
    setLoading(true);

    try {
      let logoUrl = settings.logoUrl;
      if (logoFile) {
        const uploadResult = await uploadFile(logoFile);
        logoUrl = uploadResult.url;
      }

      await saveUserProfileMeta(currentUser.uid, {
        companyName: settings.companyName,
        address: settings.companyAddress,
      });

      await saveUserSettings(currentUser.uid, {
        primaryColor: settings.primaryColor,
        secondaryColor: settings.secondaryColor,
        proposalFooter: settings.proposalFooter,
        logoUrl,
      });

      setSettings((prev) => ({ ...prev, logoUrl }));
      setLogoFile(null);
      toast.success('Settings saved successfully!', { id: toastId });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error(error.message || 'Failed to save settings.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWhatsApp = async () => {
    if (!currentUser) return;

    const toastId = toast.loading('Connecting WhatsApp...');
    try {
      const result = await saveWhatsAppConnection({
        businessName: whatsAppConnection.businessName,
        phoneNumberId: whatsAppConnection.phoneNumberId,
        accessToken: whatsAppConnection.accessToken,
      });

      setWhatsAppConnection((prev) => ({
        ...prev,
        connected: result.connected || false,
        phoneNumberIdPreview: result.phoneNumberIdPreview || '',
        accessToken: '',
      }));
      toast.success('WhatsApp Cloud API connected.', { id: toastId });
    } catch (error) {
      console.error('Error saving WhatsApp connection:', error);
      toast.error(error.message || 'Failed to connect WhatsApp.', { id: toastId });
    }
  };

  const handleDisconnectWhatsApp = async () => {
    const toastId = toast.loading('Disconnecting WhatsApp...');
    try {
      await disconnectWhatsAppConnection();
      setWhatsAppConnection({
        businessName: '',
        phoneNumberId: '',
        accessToken: '',
        connected: false,
        phoneNumberIdPreview: '',
      });
      toast.success('WhatsApp disconnected.', { id: toastId });
    } catch (error) {
      console.error('Error disconnecting WhatsApp:', error);
      toast.error(error.message || 'Failed to disconnect WhatsApp.', { id: toastId });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your application settings.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Branding</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="logo">Company Logo</label>
            <Input
              id="logo"
              type="file"
              accept="image/png, image/jpeg"
              onChange={(event) => setLogoFile(event.target.files?.[0] || null)}
            />
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt="Company logo" className="h-16 w-16 rounded-md object-cover" />
            ) : null}
            <p className="text-xs text-muted-foreground">Upload your company logo (PNG or JPG).</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>PDF Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="pdfCompanyName">Company Name for PDFs</label>
            <Input
              id="pdfCompanyName"
              placeholder="Your Company Name"
              value={settings.companyName}
              onChange={(event) => setSettings((prev) => ({ ...prev, companyName: event.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="pdfCompanyAddress">Company Address for PDFs</label>
            <Input
              id="pdfCompanyAddress"
              placeholder="Your Company Address"
              value={settings.companyAddress}
              onChange={(event) => setSettings((prev) => ({ ...prev, companyAddress: event.target.value }))}
            />
          </div>
          <div className="flex items-center space-x-4">
            <div className="space-y-2">
              <label htmlFor="pdfColor1">Primary PDF Color</label>
              <Input
                id="pdfColor1"
                type="color"
                value={settings.primaryColor}
                onChange={(event) => setSettings((prev) => ({ ...prev, primaryColor: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="pdfColor2">Secondary PDF Color</label>
              <Input
                id="pdfColor2"
                type="color"
                value={settings.secondaryColor}
                onChange={(event) => setSettings((prev) => ({ ...prev, secondaryColor: event.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Proposal Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="proposalFooter">Default Proposal Footer</label>
            <Textarea
              id="proposalFooter"
              placeholder="Enter your default proposal footer text here"
              value={settings.proposalFooter}
              onChange={(event) => setSettings((prev) => ({ ...prev, proposalFooter: event.target.value }))}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>WhatsApp Cloud API</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <p className="font-medium text-slate-900">Connect your own WhatsApp Business sender</p>
            <p className="mt-2">
              After connecting, WorkNest can send proposal PDFs directly to client WhatsApp numbers from inside the app.
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Important: Meta must be able to reach the PDF URL publicly, so localhost-only PDF links will not work for real delivery.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="whatsappBusinessName">Business Name</label>
              <Input
                id="whatsappBusinessName"
                placeholder="Your WhatsApp business label"
                value={whatsAppConnection.businessName}
                onChange={(event) => setWhatsAppConnection((prev) => ({ ...prev, businessName: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="whatsappPhoneNumberId">Phone Number ID</label>
              <Input
                id="whatsappPhoneNumberId"
                placeholder="Meta phone_number_id"
                value={whatsAppConnection.phoneNumberId}
                onChange={(event) => setWhatsAppConnection((prev) => ({ ...prev, phoneNumberId: event.target.value }))}
              />
              {whatsAppConnection.connected && whatsAppConnection.phoneNumberIdPreview ? (
                <p className="text-xs text-emerald-600">Connected sender: {whatsAppConnection.phoneNumberIdPreview}</p>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="whatsappAccessToken">Permanent Access Token</label>
            <Input
              id="whatsappAccessToken"
              type="password"
              placeholder={whatsAppConnection.connected ? 'Saved securely on the server. Enter a new token to rotate it.' : 'Paste your WhatsApp Cloud API token'}
              value={whatsAppConnection.accessToken}
              onChange={(event) => setWhatsAppConnection((prev) => ({ ...prev, accessToken: event.target.value }))}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={handleSaveWhatsApp}>
              {whatsAppConnection.connected ? 'Update WhatsApp Connection' : 'Connect WhatsApp'}
            </Button>
            {whatsAppConnection.connected ? (
              <Button variant="outline" onClick={handleDisconnectWhatsApp}>
                Disconnect
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading}>
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
};

export default SettingsPage;
