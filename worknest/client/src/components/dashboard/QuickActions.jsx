// File: worknest/client/src/components/dashboard/QuickActions.jsx

import React from 'react';
import { PlusCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';

const QuickActions = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col space-y-2">
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Client
        </Button>
        <Button variant="secondary">
          <PlusCircle className="mr-2 h-4 w-4" /> New Proposal
        </Button>
        <Button variant="secondary">
          <PlusCircle className="mr-2 h-4 w-4" /> New Invoice
        </Button>
      </CardContent>
    </Card>
  );
};

export default QuickActions;