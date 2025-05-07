import { Clerk } from '@clerk/clerk-js';

const clerkFrontendApi = 'pk_test_bGlnaHQtaWd1YW5hLTgzLmNsZXJrLmFjY291bnRzLmRldiQ';

const clerk = new Clerk(clerkFrontendApi);

const loadClerk = async () => {
  try {
    await clerk.load();
    console.log('Clerk loaded successfully');
  } catch (error) {
    console.error('Error loading Clerk:', error);
  }
};

export { clerk, loadClerk };