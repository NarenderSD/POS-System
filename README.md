# Apna POS

A comprehensive Point of Sale (POS) system designed for cafes and restaurants. Built with Next.js, TypeScript, and Tailwind CSS.

## 🚀 Features

### Core POS Features
- **Order Management**: Create, track, and manage orders in real-time
- **Table Management**: Manage restaurant tables with status tracking
- **Kitchen Display**: Real-time order display for kitchen staff
- **Payment Processing**: Support for Cash, Card, and UPI payments
- **Receipt Generation**: Print and download receipts with GST details
- **Multi-language Support**: English and Hindi interface

### Advanced Features
- **Inventory Management**: Track stock levels, low stock alerts, supplier management
- **Sales Analytics**: Comprehensive reports with charts and insights
- **Customer Loyalty**: Points system, customer management, rewards
- **Staff Management**: Attendance tracking, performance metrics, shift management
- **Expense Tracking**: Budget management, expense categories, financial reports
- **Recipe Management**: Recipe database, ingredient tracking, cost calculations

### Business Features
- **GST Compliance**: Automatic tax calculations (18% GST)
- **Service Charge**: Configurable service charge (10%)
- **Loyalty Points**: Customer retention program
- **Real-time Notifications**: Order updates and alerts
- **Offline Support**: Works without internet connection
- **Data Export**: Export reports in CSV format

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Charts**: Recharts
- **Icons**: Lucide React
- **State Management**: React Context API
- **Data Storage**: LocalStorage (can be extended to database)

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pos-system
   ```

2. **Install dependencies**
   ```bash
   # Using npm
   npm install

   # Using yarn
   yarn install

   # Using pnpm (recommended)
   pnpm install
   ```

3. **Run the development server**
   ```bash
   # Using npm
   npm run dev

   # Using yarn
   yarn dev

   # Using pnpm
   pnpm dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏃‍♂️ Quick Start

1. **Access the POS System**
   - Open the application in your browser
   - The main POS interface will be displayed

2. **Start Taking Orders**
   - Browse menu items by category
   - Add items to cart
   - Select table (for dine-in orders)
   - Choose payment method
   - Complete the order

3. **Access Management Features**
   - Click the settings icon (⚙️) in the header
   - Select from various management options:
     - Sales Analytics
     - Inventory Management
     - Customer Loyalty
     - Staff Management
     - Expense Tracker
     - Recipe Manager

## 📊 Key Features Explained

### 1. Inventory Management
- Track stock levels for all ingredients
- Set minimum stock alerts
- Manage suppliers and costs
- Monitor expiry dates
- Generate stock reports

### 2. Sales Analytics
- Daily, weekly, monthly sales reports
- Payment method breakdown
- Top-selling items analysis
- Hourly sales patterns
- Growth rate calculations

### 3. Customer Loyalty
- Points-based reward system
- Customer profiles and preferences
- Tier-based benefits (Bronze, Silver, Gold, Platinum)
- Purchase history tracking
- Birthday and anniversary notifications

### 4. Staff Management
- Employee profiles and roles
- Attendance tracking
- Performance metrics
- Shift management
- Salary tracking

### 5. Expense Tracking
- Categorize expenses (ingredients, utilities, rent, etc.)
- Budget management
- Cost analysis
- Financial reporting
- Vendor management

### 6. Recipe Management
- Recipe database with ingredients
- Cost calculation per serving
- Nutritional information
- Cooking instructions
- Profit margin analysis

## 🎯 Use Cases

### For Restaurant Owners
- Complete business overview
- Financial tracking and reporting
- Staff performance monitoring
- Inventory optimization
- Customer retention strategies

### For Managers
- Real-time order monitoring
- Table management
- Staff scheduling
- Quality control
- Operational efficiency

### For Kitchen Staff
- Order queue management
- Recipe access
- Preparation time tracking
- Ingredient requirements

### For Wait Staff
- Order taking and modification
- Table status tracking
- Customer preferences
- Payment processing

## 🔧 Configuration

### Tax Settings
- GST Rate: 18% (configurable)
- Service Charge: 10% (configurable)
- Loyalty Points: 1% of bill amount (configurable)

### Business Settings
- Restaurant name and details
- Contact information
- Operating hours
- Table configuration
- Menu categories

## 📱 Responsive Design

The system is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- Touch-screen POS terminals

## 🔒 Data Security

- Local data storage (no external dependencies)
- Secure payment processing
- User role-based access control
- Data backup and export capabilities

## 🚀 Deployment

### Production Build
```bash
# Build the application
npm run build

# Start production server
npm start
```

### Environment Variables
Create a `.env.local` file for production settings:
```env
NEXT_PUBLIC_RESTAURANT_NAME="Satvik Cafe"
NEXT_PUBLIC_GST_RATE=18
NEXT_PUBLIC_SERVICE_CHARGE=10
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Email: support@satvikcafe.com
- Phone: +91 98765 43210
- Documentation: [Link to docs]

## 🔄 Updates

### Version 1.0.0
- Initial release with core POS features
- Inventory management system
- Sales analytics and reporting
- Customer loyalty program
- Staff management
- Expense tracking
- Recipe management

### Planned Features
- Online ordering integration
- Delivery management
- Advanced reporting
- Multi-location support
- API integration
- Cloud backup

---

**Build by Narender Singh**  
[LinkedIn](https://www.linkedin.com/in/narendersingh1/) 

## Troubleshooting

If you see an error like `