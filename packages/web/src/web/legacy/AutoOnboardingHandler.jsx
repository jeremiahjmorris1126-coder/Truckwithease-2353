import { useEffect } from 'react';
import PocketBase from 'pocketbase';

const pb = new PocketBase();

export default function AutoOnboardingHandler({ children }) {
  useEffect(() => {
    handleAutoOnboarding();
  }, []);

  async function handleAutoOnboarding() {
    try {
      // Check if user just completed payment
      const params = new URLSearchParams(window.location.search);
      const subscriptionId = params.get('sub');
      
      // Check for stored checkout data
      const checkoutData = sessionStorage.getItem('checkout_data');
      const signupEmail = sessionStorage.getItem('signup_email');

      // Only trigger if user came from checkout and hasn't seen onboarding yet
      if (subscriptionId || (checkoutData && !sessionStorage.getItem('onboarding_shown'))) {
        
        // Get subscription details
        let subscription = null;
        if (subscriptionId) {
          try {
            subscription = await pb.collection('subscriptions').getOne(subscriptionId);
          } catch (e) {
            console.log('Subscription lookup: waiting for sync');
          }
        }

        // Check if fleet profile exists
        let hasFleetProfile = false;
        if (signupEmail || (subscription && subscription.email)) {
          const email = signupEmail || subscription?.email;
          try {
            const profiles = await pb.collection('fleet_profiles').getList(1, 1, {
              filter: `contact_email = "${email}"`,
            });
            hasFleetProfile = profiles.items.length > 0;
          } catch (e) {
            // Profile doesn't exist yet
          }
        }

        // If no fleet profile, redirect to complete it
        if (!hasFleetProfile && window.location.pathname !== '/fleet-profile') {
          // Store the subscription ID for reference during profile completion
          if (subscriptionId) {
            sessionStorage.setItem('subscription_id', subscriptionId);
          }
          sessionStorage.setItem('onboarding_shown', 'true');
          window.location.href = '/fleet-profile';
        }
      }

      // Clean up expired session data
      const lastCleanup = sessionStorage.getItem('last_cleanup');
      const now = Date.now();
      if (!lastCleanup || now - parseInt(lastCleanup) > 3600000) { // 1 hour
        if (sessionStorage.getItem('onboarding_completed')) {
          sessionStorage.removeItem('checkout_data');
          sessionStorage.removeItem('signup_email');
          sessionStorage.removeItem('onboarding_shown');
        }
        sessionStorage.setItem('last_cleanup', now.toString());
      }

    } catch (err) {
      console.error('Auto-onboarding check failed:', err);
    }
  }

  return children;
}
