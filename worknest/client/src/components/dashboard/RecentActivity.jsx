// File: worknest/client/src/components/dashboard/RecentActivity.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getRecentActivities } from '../../services/activityService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { formatDistanceToNow } from 'date-fns';

const RecentActivity = () => {
  const { currentUser } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      if (currentUser) {
        try {
          const userActivities = await getRecentActivities(currentUser.uid);
          setActivities(userActivities);
        } catch (error) {
          console.error("Error fetching recent activities:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchActivities();
  }, [currentUser]);
  
  const formatDate = (timestamp) => {
    if (!timestamp || typeof timestamp.toDate !== 'function') return '';
    return formatDistanceToNow(timestamp.toDate(), { addSuffix: true });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>A log of your recent actions in WorkNest.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Loading activity...</p>
        ) : activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start">
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.title}</p>
                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                </div>
                <div className="text-sm text-muted-foreground">{formatDate(activity.createdAt)}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No recent activity to display.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivity;