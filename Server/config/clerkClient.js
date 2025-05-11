const { createClerkClient } = require("@clerk/clerk-sdk-node");

const clearkClientInstance = (secretKey) => {
  try {
    return createClerkClient({
      secretKey:
        process.env.CLERK_SECRET_KEY ||
        secretKey ||
        "sk_test_GTEqipl0juy6UBCwfIrQTVApvdWhrgjbnrnU3lEmv4", //"sk_test_pijqBQlBjeW85dm0GyX56jXVzVr0FkhBmCeSLwYskS",
    });
  } catch (err) {
    console.error("Error creating Clerk instance:", err);
  }
};

module.exports = clearkClientInstance;
