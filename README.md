# 🌍 UrbanScale

**AI-Powered Location Intelligence Platform**

UrbanScale helps you find the perfect location based on what matters most to you. Using advanced AI and real-time data, it analyzes neighborhoods and provides comprehensive scores for education, entertainment, health, and financial amenities.

---

## ✨ Features

- 🤖 **AI-Driven Analysis** - Describe your needs in natural language, let AI calculate optimal weights
- 📊 **Smart Scoring** - Detailed scores based on proximity and density of amenities
- �️ **Interactive Maps** - Visualize nearby amenities with color-coded markers
- 🌫️ **Air Quality Data** - Real-time pollution levels and health recommendations
- 🚇 **Commute Insights** - Estimate travel times to nearest public transit
- � **Save & Compare** - Save your analyses and revisit them anytime
- 📱 **Responsive Design** - Beautiful UI that works seamlessly on all devices

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- MongoDB
- API Keys (Groq AI)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/mvishok/urbanscale.git
cd urbanscale
```

2. **Install dependencies**
```bash
# Server
cd server
npm install

# Client
cd ../client
npm install
```

3. **Configure environment variables**

Create `.env` file in the `server` directory:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
PORT=3000
```

4. **Run the application**
```bash
# Server (from server directory)
npm run dev

# Client (from client directory)
npm run dev
```

5. **Access the app**
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`


## 🎯 How It Works

1. **Enter Location** - Provide coordinates or use your current location
2. **Describe Priorities** - Tell the AI what matters to you (e.g., "I'm a student looking for good schools")
3. **Get Instant Analysis** - Receive comprehensive scores and insights
4. **Adjust & Explore** - Fine-tune weights and explore the interactive map
5. **Save Results** - Keep track of locations you're interested in

---

## 🛠️ Tech Stack

**Frontend**
- React 18 + Vite
- Tailwind CSS
- Framer Motion
- Leaflet Maps

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication

**APIs & AI**
- Groq AI (Llama 3.3)
- OpenStreetMap
- OpenAQ

---

## � Screenshots

> *Premium glass-morphism design with gradient accents and smooth animations*

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

This project is licensed under the MIT License.

---

## 🔗 Links

- **Repository**: [github.com/mvishok/urbanscale](https://github.com/mvishok/urbanscale)
- **Issues**: [Report a bug](https://github.com/mvishok/urbanscale/issues)

---

<div align="center">
Made for Indians, by Indians.</a>
</div>
