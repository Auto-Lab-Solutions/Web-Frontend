# Auto Lab Solutions - Frontend

A modern React-based web application for Auto Lab Solutions, providing vehicle inspection and automotive services booking platform.

## 🚀 Features

- **Vehicle Inspection Booking**: Comprehensive pre-purchase inspection services
- **Service Management**: Mobile battery replacement, oil changes, paint correction
- **Order Management**: Auto parts and accessories ordering system  
- **Payment Integration**: Secure Stripe payment processing
- **Responsive Design**: Mobile-first responsive interface
- **Real-time Updates**: Live status updates for bookings and orders

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **UI Components**: Radix UI, Lucide React, Framer Motion
- **Payment**: Stripe
- **State Management**: React Context API
- **Build Tool**: Vite
- **Deployment**: AWS S3 + CloudFront

## 📋 Prerequisites

- Node.js 22.x or higher
- npm or yarn
- AWS CLI (for deployment)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Web-Frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 🌍 Environment Configuration

The application uses a comprehensive environment configuration system. See [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) for detailed configuration guide.

### Quick Setup

```bash
# Development
npm run dev

# Production build
npm run build:prod

# Preview production build
npm run preview
```

### Required Environment Variables

```bash
VITE_API_BASE_URL=https://your-api-domain.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_or_live_key
VITE_NODE_ENV=development|production
```

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── common/          # Common components (Header, Footer, etc.)
│   ├── contexts/        # React Context providers
│   ├── home/           # Home page components
│   ├── payment/        # Payment-related components
│   └── ui/             # Base UI components
├── config/             # Configuration files
│   └── env.js          # Environment configuration
├── pages/              # Page components
├── utils/              # Utility functions
├── classes/            # Class definitions (RestClient, etc.)
├── meta/               # Static data and metadata
└── assets/             # Static assets
```

## 🔨 Available Scripts

- `npm run dev` - Start development server
- `npm run build:dev` - Build for development
- `npm run build:prod` - Build for production
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run preview` - Preview production build
- `npm run clean` - Clean build artifacts

## 🚀 Deployment

### Automated Deployment

The application uses GitHub Actions for automated deployment:

- **Development**: Triggered on push to `dev` branch
- **Production**: Triggered on push to `prod` or `main` branch
- **Manual**: Use workflow_dispatch for manual deployments

### Manual Deployment

```bash
# Build for production
npm run build:prod

# Deploy to AWS S3 (requires AWS CLI configuration)
aws s3 sync dist/ s3://your-bucket-name/
```

## 🧪 Testing

```bash
# Run configuration tests
./test-payment-implementation.sh

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

## 🔐 Security

- Environment variables for sensitive data
- Stripe secure payment processing
- HTTPS-only in production
- CSP headers configured
- Regular security audits

## 📖 Documentation

- [Environment Setup Guide](./ENVIRONMENT_SETUP.md)
- [Payment Implementation](./PAYMENT_IMPLEMENTATION.md)
- [API Specification](./external/PAYMENT_API_SPECIFICATION.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software for Auto Lab Solutions.

## 🆘 Support

For technical support or questions:
- Check the [Environment Setup Guide](./ENVIRONMENT_SETUP.md)
- Run the configuration test script
- Contact the development team

## 🏗️ Development Workflow

1. **Local Development**
   ```bash
   npm run dev
   ```

2. **Before Committing**
   ```bash
   npm run lint:fix
   npm run build:dev
   ```

3. **Testing Configuration**
   ```bash
   ./test-payment-implementation.sh
   ```

4. **Production Deployment**
   - Merge to `prod` branch for automatic deployment
   - Or use manual deployment workflow
