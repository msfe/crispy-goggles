const { ConfidentialClientApplication } = require('@azure/msal-node');

// Validate required environment variables
const requiredEnvVars = ['AZURE_CLIENT_ID', 'AZURE_CLIENT_SECRET', 'AZURE_TENANT_ID', 'AZURE_CLOUD_INSTANCE'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.warn('⚠️  Azure CIAM authentication is not configured.');
  console.warn('Missing environment variables:', missingVars.join(', '));
  console.warn('Please refer to docs/AZURE_CIAM_SETUP.md for setup instructions.');
  console.warn('Authentication endpoints will return configuration errors until properly configured.');
}

// MSAL configuration
const msalConfig = {
  auth: {
    clientId: process.env.AZURE_CLIENT_ID || 'not_configured',
    clientSecret: process.env.AZURE_CLIENT_SECRET || 'not_configured',
    authority: `${process.env.AZURE_CLOUD_INSTANCE || 'https://login.microsoftonline.com/'}${process.env.AZURE_TENANT_ID || 'common'}`,
  },
  system: {
    loggerOptions: {
      loggerCallback(logLevel, message) {
        if (process.env.NODE_ENV === 'development') {
          console.log(message);
        }
      },
      piiLoggingEnabled: false,
      logLevel: process.env.NODE_ENV === 'development' ? 'Info' : 'Error',
    },
  },
};

// Create MSAL instance only if properly configured
let cca = null;
try {
  if (missingVars.length === 0) {
    cca = new ConfidentialClientApplication(msalConfig);
  }
} catch (error) {
  console.error('Failed to initialize Azure CIAM client:', error.message);
}

module.exports = { cca, msalConfig, isConfigured: missingVars.length === 0 };