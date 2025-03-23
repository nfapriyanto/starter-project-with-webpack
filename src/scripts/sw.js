self.addEventListener('push', (event) => {
  console.log('Service worker received push message');

  // Function to handle the push notification
  const handlePushEvent = async () => {
    let notificationData;

    try {
      // Check if we have data
      if (event.data) {
        // Try to parse as JSON first
        try {
          notificationData = event.data.json();
          console.log('Successfully parsed push data as JSON:', notificationData);
        } catch (error) {
          // If JSON parsing fails, use text content
          const textContent = await event.data.text();
          console.log('Push data is not JSON, using as text:', textContent);
          
          notificationData = {
            title: textContent,
            options: {
              body: 'Notification from Dicoding Story App'
            }
          };
        }
      } else {
        // Default notification if no data received
        notificationData = {
          title: 'New Notification',
          options: {
            body: 'You have a new notification from Dicoding Story App'
          }
        };
      }

      // Show the notification
      return self.registration.showNotification(
        notificationData.title, 
        notificationData.options || { body: 'Notification details' }
      );
      
    } catch (error) {
      console.error('Error handling push notification:', error);
      
      // Fallback notification
      return self.registration.showNotification('New Notification', {
        body: 'You have a new notification from Dicoding Story App'
      });
    }
  };

  // Wait until the push has been handled
  event.waitUntil(handlePushEvent());
});

// Add notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // This will open the app when the user clicks on the notification
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        // If no window is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
  );
});