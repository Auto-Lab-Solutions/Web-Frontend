/**
 * Deployment configuration utility
 * Provides environment-specific AWS region and deployment settings
 */

// Environment-specific AWS regions
const AWS_REGIONS = {
  development: 'us-east-1',
  production: 'ap-southeast-2'
}

// Get current environment
const getCurrentEnvironment = () => {
  return import.meta.env.VITE_ENVIRONMENT || 'development'
}

// Get AWS region for current environment
const getAWSRegion = () => {
  const environment = getCurrentEnvironment()
  return import.meta.env.VITE_AWS_REGION || AWS_REGIONS[environment] || 'us-east-1'
}

// Get environment-specific configuration
const getDeploymentConfig = () => {
  const environment = getCurrentEnvironment()
  const awsRegion = getAWSRegion()
  
  return {
    environment,
    awsRegion,
    isDevelopment: environment === 'development',
    isProduction: environment === 'production',
    apiBaseUrl: import.meta.env.VITE_API_GATEWAY_BASE_URL,
    webSocketBaseUrl: import.meta.env.VITE_WEB_SOCKET_BASE_URL,
    stripePublishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
    nodeEnv: import.meta.env.VITE_NODE_ENV || 'development',
    mechanicsCount: parseInt(import.meta.env.VITE_MECHANICS_COUNT) || 1
  }
}

// AWS region-specific configurations
const getRegionConfig = (region = null) => {
  const targetRegion = region || getAWSRegion()
  
  const configs = {
    'us-east-1': {
      region: 'us-east-1',
      name: 'US East (N. Virginia)',
      timeZone: 'America/New_York',
      cloudFrontEdgeLocations: ['IAD', 'DCA', 'BWI']
    },
    'ap-southeast-2': {
      region: 'ap-southeast-2',
      name: 'Asia Pacific (Sydney)',
      timeZone: 'Australia/Perth', // Changed to Perth for this application
      cloudFrontEdgeLocations: ['SYD', 'MEL', 'PER']
    }
  }
  
  return configs[targetRegion] || configs['ap-southeast-2'] // Default to Perth timezone
}

// Debug function to log current configuration
const logDeploymentConfig = () => {
  if (import.meta.env.VITE_NODE_ENV === 'development') {
    const config = getDeploymentConfig()
    const regionConfig = getRegionConfig()
    
    console.group('🚀 Deployment Configuration')
    console.log('Environment:', config.environment)
    console.log('AWS Region:', config.awsRegion)
    console.log('Region Name:', regionConfig.name)
    console.log('Time Zone:', regionConfig.timeZone)
    console.log('Is Development:', config.isDevelopment)
    console.log('Is Production:', config.isProduction)
    console.log('API Base URL:', config.apiBaseUrl)
    console.log('WebSocket URL:', config.webSocketBaseUrl)
    console.groupEnd()
  }
}

export {
  getCurrentEnvironment,
  getAWSRegion,
  getDeploymentConfig,
  getRegionConfig,
  logDeploymentConfig,
  AWS_REGIONS
}
