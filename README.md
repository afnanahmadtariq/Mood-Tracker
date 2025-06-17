# 🌟 Mood Tracker

A modern, full-stack web application that helps users track their daily moods and visualize emotional trends over time. Built with Next.js, TypeScript, MongoDB, and featuring comprehensive analytics and data visualization.

## ✨ Features

### 🔐 User Authentication
- Secure user registration and login
- JWT-based authentication
- Session management
- Password encryption with bcryptjs

### 📊 Mood Tracking
- Daily mood entry with customizable notes
- Mood visualization and history
- Recent mood entries display
- Date-based mood filtering

### 📈 Analytics & Insights
- Interactive charts and graphs using Chart.js
- Mood trends over time
- Data visualization with Line, Bar, and Doughnut charts
- Empty state handling for new users

### 👤 User Profile Management
- Profile picture updates
- Personal information management
- Date of birth tracking
- Name and details editing

### 📱 Modern UI/UX
- Responsive design with Tailwind CSS
- Clean, intuitive interface
- Client-side rendering optimizations
- Loading states and error handling

## 🛠️ Tech Stack

### Frontend
- **Next.js 15.3.3** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first CSS framework
- **Chart.js & React-ChartJS-2** - Data visualization
- **React 19** - Latest React features

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **MongoDB with Mongoose** - NoSQL database
- **JWT Authentication** - Secure token-based auth
- **bcryptjs** - Password hashing

### DevOps & Deployment
- **Docker & Docker Compose** - Containerization
- **Jenkins** - CI/CD pipeline
- **MongoDB 8** - Database container
- **Node.js 24 Alpine** - Lightweight production image

### Testing
- **Selenium WebDriver** - End-to-end testing
- **Headless browser testing** - Automated UI testing
- **12 comprehensive test cases** - Full user journey coverage

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Docker & Docker Compose
- MongoDB (or use Docker setup)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/Mood-Tracker.git
   cd Mood-Tracker
   ```

2. **Install dependencies**
   ```bash
   cd mood-tracker
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the `mood-tracker` directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/moodtrackerdb
   JWT_SECRET_FALLBACK=your-secret-key-here
   ```

4. **Start MongoDB**
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:8
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Docker Deployment

1. **Set environment variables**
   ```bash
   export JWT_SECRET_FALLBACK=your-secret-key-here
   ```

2. **Start with Docker Compose**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   Navigate to [http://localhost:3200](http://localhost:3200)

## 🧪 Testing

### Running Test Suite

The project includes a comprehensive Selenium test suite covering the complete user journey:

1. **Navigate to test directory**
   ```bash
   cd testcases
   ```

2. **Install test dependencies**
   ```bash
   npm install
   ```

3. **Run all tests**
   ```bash
   ./run-tests.sh
   ```

### Test Coverage

- ✅ User Registration & Authentication
- ✅ Mood Entry Creation & Deletion  
- ✅ Analytics Navigation & Visualization
- ✅ Profile Management (Picture, Name, DOB)
- ✅ User Session Management
- ✅ Empty State Handling
- ✅ Navigation & UI Interactions

## 📁 Project Structure

```
Mood-Tracker/
├── mood-tracker/                 # Main Next.js application
│   ├── app/
│   │   ├── api/                 # API routes
│   │   │   ├── auth/            # Authentication endpoints
│   │   │   ├── mood/            # Mood CRUD operations
│   │   │   └── profile/         # Profile management
│   │   ├── components/          # Reusable UI components
│   │   ├── context/             # React Context providers
│   │   ├── hooks/               # Custom React hooks
│   │   ├── lib/                 # Utility libraries
│   │   ├── models/              # MongoDB models
│   │   └── analytics/           # Analytics page
│   ├── package.json
│   └── ...
├── testcases/                   # Selenium test suite
│   ├── test1.js - test12.js     # Individual test cases
│   ├── run-tests.sh             # Test runner script
│   └── package.json
├── docker-compose.yml           # Docker orchestration
├── Dockerfile                   # Container definition
├── Jenkinsfile                  # CI/CD pipeline
└── README.md                    # This file
```

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Mood Management
- `GET /api/mood` - Fetch user's mood entries
- `POST /api/mood` - Create new mood entry
- `DELETE /api/mood` - Delete mood entry

### Profile Management
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET_FALLBACK` | JWT signing secret | Yes |

### Docker Configuration

The application uses multi-service Docker setup:
- **Web Service**: Next.js application (Port 3200 → 3000)
- **MongoDB Service**: Database container (Port 27017)
- **Persistent Volume**: MongoDB data storage

## 🏗️ CI/CD Pipeline

The project includes a Jenkins pipeline (`Jenkinsfile`) for automated:
- ✅ Code checkout
- ✅ Dependency installation
- ✅ Build process
- ✅ Test execution
- ✅ Docker image creation
- ✅ Deployment automation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

If you encounter any issues or have questions:
1. Check the [Issues](https://github.com/afnanahmadtariq/Mood-Tracker/issues) page
2. Create a new issue with detailed information
3. Include error logs and environment details

## 🎯 Future Enhancements

- [ ] Mobile app development
- [ ] Data export functionality
- [ ] Mood sharing with friends
- [ ] Advanced analytics and insights
- [ ] Mood prediction algorithms
- [ ] Integration with wearable devices
- [ ] Multi-language support

---

**Made with ❤️ for better mental health awareness and tracking**