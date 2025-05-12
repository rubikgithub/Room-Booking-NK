import { Clerk } from '@clerk/clerk-js';
console.log(import.meta.env.VITE_API_URL)
const clerkFrontendApi =  import.meta.env.VITE_API_URL;
// 'pk_test_bGlnaHQtaWd1YW5hLTgzLmNsZXJrLmFjY291bnRzLmRldiQ';
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