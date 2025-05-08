const { createClerkClient } = require("@clerk/clerk-sdk-node");

const clearkClientInstance = (secretKey) => {
  try {
    console.log(process.env.CLERK_SECRET_KEY);
    return createClerkClient({
      secretKey:  'sk_test_pijqBQlBjeW85dm0GyX56jXVzVr0FkhBmCeSLwYskS',
      // secretKey:  'sk_test_GTEqipl0juy6UBCwfIrQTVApvdWhrgjbnrnU3lEmv4',
    });
  } catch (err) {
    console.error("Error creating Clerk instance:", err);
  }
};

module.exports = clearkClientInstance;
