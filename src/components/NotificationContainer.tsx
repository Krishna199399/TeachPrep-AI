import React from 'react';
import Notification from '@/components/Notification';
import { useAppContext } from '@/context/AppContext';

export default function NotificationContainer() {
  const { activeNotification, dismissNotification, markNotificationAsRead } = useAppContext();
  
  if (!activeNotification) return null;
  
  const handleClose = () => {
    markNotificationAsRead(activeNotification.id);
    dismissNotification();
  };
  
  return (
    <Notification
      message={activeNotification.message}
      type={activeNotification.type}
      isVisible={!!activeNotification}
      onClose={handleClose}
    />
  );
} 