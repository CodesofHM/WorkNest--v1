// File: worknest/client/src/components/UpgradeModal.jsx

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { Button } from './ui/Button';

const UpgradeModal = ({ feature, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Upgrade Required</CardTitle>
          <CardDescription>
            The "{feature}" feature is only available on a higher plan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Please upgrade your plan to access this and other powerful features to grow your freelance business.
          </p>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Maybe Later
            </Button>
            <Button>
              Upgrade Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UpgradeModal;