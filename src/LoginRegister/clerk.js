import { Clerk } from '@clerk/clerk-js';

const clerkFrontendApi = 'pk_test_c2VjdXJlLWNoaWNrZW4tNTAuY2xlcmsuYWNjb3VudHMuZGV2JA';

const clerk = new Clerk(clerkFrontendApi);

const loadClerk = async () => {
  try {
    
    await clerk.load();
    console.log('Clerk loaded successfully');
    return true
  } catch (error) {
    console.error('Error loading Clerk:', error);
  }
};

export { clerk, loadClerk };