import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

const SettingsPage = () => {
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
            <Input id="logo" type="file" />
            <p className="text-xs text-muted-foreground">Upload your company logo (PNG, JPG, GIF).</p>
          </div>
          <Button>Save Branding</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>PDF Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="pdfCompanyName">Company Name for PDFs</label>
            <Input id="pdfCompanyName" placeholder="Your Company Name" />
          </div>
          <div className="space-y-2">
            <label htmlFor="pdfCompanyAddress">Company Address for PDFs</label>
            <Input id="pdfCompanyAddress" placeholder="Your Company Address" />
          </div>
          <div className="flex items-center space-x-4">
            <div className="space-y-2">
              <label htmlFor="pdfColor1">Primary PDF Color</label>
              <Input id="pdfColor1" type="color" defaultValue="#000000" />
            </div>
            <div className="space-y-2">
              <label htmlFor="pdfColor2">Secondary PDF Color</label>
              <Input id="pdfColor2" type="color" defaultValue="#ffffff" />
            </div>
          </div>
          <Button>Save PDF Settings</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Proposal Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="proposalFooter">Default Proposal Footer</label>
            <Input id="proposalFooter" placeholder="Enter your default proposal footer text here" />
          </div>
          <Button>Save Proposal Settings</Button>
        </CardContent>
      </Card>

    </div>
  );
};

export default SettingsPage;