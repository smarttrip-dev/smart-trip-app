# 🚀 SmartTrip - Local Setup Guide for Client

**Last Updated:** March 5, 2026  
**Difficulty Level:** Medium  
**Setup Time:** 15-20 minutes  

---

## 📋 Prerequisites

Before starting, ensure you have the following installed on your PC:

### **Required Software**
1. **Git** - [Download here](https://git-scm.com)
   - Used to clone the project from GitHub
   
2. **Node.js (v16+)** - [Download here](https://nodejs.org)
   - Includes npm (package manager)
   
3. **MongoDB** - [Download Community Edition](https://www.mongodb.com/try/download/community)
   - Local database for the application
   - OR use **MongoDB Atlas** for cloud-hosted database (easier option)

4. **VS Code** (Optional) - [Download here](https://code.visualstudio.com)
   - Recommended code editor

### **Verify Installation**
Open Command Prompt/PowerShell and run:
```bash
git --version
node --version
npm --version
```

---

## 🔧 Step 1: Clone the Project from GitHub

1. **Open Command Prompt or PowerShell**

2. **Navigate to where you want the project:**
   ```bash
   cd Documents
   # or any folder you prefer
   ```

3. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/smart-trip-app.git
   cd smart-trip-app
   ```
   *(Replace `YOUR_USERNAME` with your actual GitHub username)*

---

## 🗄️ Step 2: Set Up Database

### **Option A: MongoDB Atlas (Cloud - Recommended for Beginners)**

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a cluster
4. Create a database user with username and password
5. Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/smarttrip`)
6. **Note this string** - you'll need it in Step 4

### **Option B: MongoDB Local**

1. Install MongoDB
2. Start MongoDB:
   - **Windows:** Open Services → find "MongoDB Server" → Start
3. Default connection: `mongodb://localhost:27017/smarttrip`

---

## ⚙️ Step 3: Set Up Environment Variables

### **Backend Configuration**

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```

2. Create a `.env` file:
   ```bash
   # Windows Command Prompt
   type nul > .env
   
   # Or use VS Code: Right-click → New File → name it ".env"
   ```

3. Add these variables to `.env`:
   ```
   MONGODB_URI=mongodb://localhost:27017/smarttrip
   PORT=5000
   JWT_SECRET=your_secret_key_here_change_this
   NODE_ENV=development
   ```

   **Replace:**
   - `MONGODB_URI` with your MongoDB connection string (from Step 2)
   - `JWT_SECRET` with a random secure string

### **Frontend Configuration**

1. Navigate to the frontend folder:
   ```bash
   cd ../frontend
   ```

2. Create a `.env.local` file with:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

---

## 📦 Step 4: Install Dependencies

### **Backend Dependencies**

```bash
cd backend
npm install
```

### **Frontend Dependencies**

```bash
cd ../frontend
npm install
```

---

## 🌱 Step 5: Seed the Database (First Time Only)

After installing backend dependencies, seed the database with initial data:

```bash
cd backend
npm run seed
```

You should see output like:
```
✅ Database seeded successfully!
98 configuration records added
```

---

## ▶️ Step 6: Run the Application

### **Terminal 1 - Start Backend Server**

```bash
cd backend
npm run dev
```

Expected output:
```
🚀 Server running on http://localhost:5000
✅ MongoDB connected
```

### **Terminal 2 - Start Frontend Development Server**

Open a **new terminal/command prompt** and:

```bash
cd frontend
npm run dev
```

Expected output:
```
➜  Local:   http://localhost:5173/
```

### **Open in Browser**

Visit: **http://localhost:5173**

---

## ✅ Verify Everything Works

1. ✅ Frontend loads without errors
2. ✅ You can see the HomePage
3. ✅ API endpoints respond (check browser console for any errors)
4. ✅ Database operations work

---

## 📁 Project Structure

```
smart-trip-app/
├── backend/                    # Node.js + Express server
│   ├── src/
│   │   ├── server.js          # Main server file
│   │   ├── config/            # Database config
│   │   ├── controllers/       # Request handlers
│   │   ├── models/            # Database schemas
│   │   ├── routes/            # API routes
│   │   └── seed.js            # Database seeder
│   └── .env                   # Environment variables
│
├── frontend/                  # React + Vite app
│   ├── src/
│   │   ├── pages/            # Page components
│   │   ├── components/       # Reusable components
│   │   ├── hooks/            # Custom React hooks
│   │   └── App.jsx           # Main app component
│   └── .env.local            # Environment variables
│
└── README_REFACTORING.md      # Technical documentation
```

---

## 🔍 API Endpoints Reference

The application provides these main endpoints:

### **Auth**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### **Configuration** (Read-Only)
- `GET /api/config/cities` - All cities
- `GET /api/config/services` - All services
- `GET /api/config/destinations` - All destinations

### **Trips**
- `GET /api/trips` - Get user's trips
- `POST /api/trips` - Create new trip
- `PUT /api/trips/:id` - Update trip
- `DELETE /api/trips/:id` - Delete trip

See `IMPLEMENTATION_GUIDE.md` for complete API documentation.

---

## ❌ Troubleshooting

### **Problem: "MongoDB connection failed"**
- ✅ Check MONGODB_URI in `.env`
- ✅ Ensure MongoDB is running (Atlas or local)
- ✅ Check username/password if using Atlas

### **Problem: "Port 5000 already in use"**
```bash
# Change PORT in backend/.env to 5001 or 5002
# Then update VITE_API_URL in frontend/.env.local
```

### **Problem: "npm install fails"**
```bash
# Delete node_modules and package-lock.json, then retry
rm -r node_modules package-lock.json
npm install
```

### **Problem: "Frontend can't connect to API"**
- ✅ Backend server must be running
- ✅ Check VITE_API_URL in frontend/.env.local
- ✅ Check browser console for error messages

### **Problem: ".env file won't create"**
- Use VS Code to create the file
- Or use command: `echo.> .env` (Windows)

---

## 🚀 Next Steps

Once everything is running:

1. **Explore the Admin Dashboard:** Login with test credentials
2. **Review the Code:** Check `README_REFACTORING.md` for architecture details
3. **Customize:** Modify cities, services, destinations through database
4. **Deploy:** See `DEPLOYMENT_CHECKLIST.md` when ready for production

---

## 📞 Need Help?

If you encounter issues:

1. Check the error message carefully
2. Review the **Troubleshooting** section above
3. Check documentation files:
   - `README_REFACTORING.md` - Architecture overview
   - `IMPLEMENTATION_GUIDE.md` - Full API reference
   - `DEPLOYMENT_CHECKLIST.md` - Deployment guide

---

## 🎯 Quick Reference Commands

```bash
# Clone project
git clone https://github.com/YOUR_USERNAME/smart-trip-app.git

# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Seed database (first time only)
cd backend && npm run seed

# Start development servers
# Terminal 1:
cd backend && npm run dev

# Terminal 2:
cd frontend && npm run dev

# Access application
http://localhost:5173
```

---

**Happy coding! 🎉**
