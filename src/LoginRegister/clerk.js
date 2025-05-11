import { Clerk } from '@clerk/clerk-js';

const clerkFrontendApi = 'pk_test_Z3Jvd2luZy1tb2xseS04MC5jbGVyay5hY2NvdW50cy5kZXYk';
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