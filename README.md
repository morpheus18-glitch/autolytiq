# AutolytiQ - Dealership Management System

🚀 **Live Demo**: [autolytiq.com](https://autolytiq.com)

## Overview

AutolytiQ is a comprehensive dealership management system built with modern web technologies. It provides automotive dealerships with advanced CRM capabilities, AI-powered analytics, competitive pricing intelligence, and streamlined operations management.

## Features

### Core Management
- **Vehicle Inventory Management** - Complete vehicle lifecycle tracking with pricing insights
- **Customer Relationship Management** - Advanced CRM with customer analytics and lead tracking
- **Sales & Lead Management** - Comprehensive sales pipeline and deal desk functionality
- **Service Department** - Service scheduling and customer management

### Advanced Analytics
- **AI-Powered Pricing Intelligence** - Machine learning-based competitive pricing analysis
- **Web Scraping Integration** - Real-time competitor data collection from AutoTrader, Cars.com, CarGurus
- **Performance Analytics** - Comprehensive reporting and business intelligence
- **Customer Behavior Tracking** - Pixel tracking and session analytics

### Professional Features
- **Showroom Manager** - Customer session tracking with real-time status monitoring
- **Deal Desk** - Professional deal structuring and negotiation tools
- **Financial Analytics** - Revenue tracking and profitability analysis
- **Mobile-Optimized** - Responsive design for all devices

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** with shadcn/ui components
- **TanStack React Query** for state management
- **Wouter** for routing
- **Recharts** for data visualization

### Backend
- **Node.js** with Express.js
- **PostgreSQL** with Drizzle ORM
- **Python ML Backend** with scikit-learn and XGBoost
- **WebSocket** support for real-time updates

### Machine Learning
- **Autonomous Vehicle Scraping** - Headless browser automation with bot detection bypass
- **XGBoost Price Prediction** - ML models for pricing recommendations
- **Data Pipeline** - Automated data cleaning and validation
- **Model Retraining** - Intelligent model updates with performance monitoring

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set up Database**
   ```bash
   npm run db:push
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Access the Application**
   - Frontend: `http://localhost:5000`
   - ML Dashboard: `http://localhost:8501` (Streamlit)

## Environment Variables

```env
DATABASE_URL=your_postgresql_connection_string
SESSION_SECRET=your_session_secret
VITE_GA_MEASUREMENT_ID=your_google_analytics_id
```

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utility functions
├── server/                # Express.js backend
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Database operations
│   └── services/          # Business logic
├── ml_backend/            # Python ML system
│   ├── scraping/          # Web scraping modules
│   ├── training/          # ML model training
│   └── api/               # Flask API endpoints
├── shared/                # Shared TypeScript types
└── docs/                  # Documentation
```

## Key Features

### Enhanced Search & Filtering
- Multi-criteria search across all modules
- Real-time filtering with advanced operators
- Summary statistics and data visualization
- Persistent filter state management

### Professional Table Layouts
- Responsive design with smart column hiding
- Mobile-first approach with touch-friendly interfaces
- Consistent styling across all administrative modules
- Hover effects and clickable actions

### ML-Powered Insights
- Automated competitive pricing analysis
- Market trend predictions
- Customer behavior analytics
- Performance optimization recommendations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions, visit [autolytiq.com](https://autolytiq.com)

---

**AutolytiQ** - Transforming automotive dealership management with AI-powered analytics and intelligent automation.