// File: worknest/client/src/components/dashboard/RevenueChart.jsx

import React from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';

const RevenueChart = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Overview</CardTitle>
        <CardDescription>Your monthly earnings from paid invoices.</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Safely check if data exists and has items before rendering */}
        {data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
              <Tooltip
                cursor={{ fill: 'transparent' }}
                contentStyle={{ background: 'white', border: '1px solid #ccc', borderRadius: '0.5rem' }}
              />
              <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px]">
            <p className="text-muted-foreground">No revenue data yet. Mark an invoice as paid to see it here.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RevenueChart;
