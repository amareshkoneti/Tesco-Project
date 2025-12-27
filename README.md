# 🎨 Retail Media Creative Builder Using Generative AI

<div align="center">

**Revolutionizing Retail Media Creative Production with Generative AI**

[Demo](#-demo) • [Features](#-key-features) • [Installation](#-installation--setup) • [Tech Stack](#-tech-stack) • [Team](#-team)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Problem Statement](#-problem-statement)
- [Solution](#-solution)
- [Key Features](#-key-features)
- [Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Installation & Setup](#-installation--setup)
- [Project Structure](#-project-structure)
- [Usage Guide](#-usage-guide)
- [Demo](#-demo)
- [Future Enhancements](#-future-enhancements)
- [Team](#-team)
- [License](#-license)

---

## 🌟 Overview

The **AI-Powered Retail Media Creative Builder & Compliance Engine** is a cutting-edge creative automation platform that revolutionizes how advertisers generate professional, retailer-compliant creative assets across multiple media formats using **Generative AI**.

### 🎯 Mission
Empower **non-expert advertisers** to design, validate, and export campaign-ready creatives that comply with strict **retailer guidelines** and **brand identity constraints**, while maintaining creative freedom within safe, controlled boundaries.

### 💡 Why This Matters
- Reduction in creative production time
- Cost savings compared to traditional agency workflows
- Compliance validation before submission
- **Zero** technical expertise required

---

## 🔴 Problem Statement

### Current Challenges in Retail Media Creative Production

Businesses relying on **retail media networks** face significant obstacles:

#### 1. **Complex Compliance Requirements**
- Retailer-specific guidelines (layout, logos, pricing rules, accessibility)
- Brand identity constraints (color palette, tone, logo usage)
- Alcohol advertising regulations
- Multi-format specifications

#### 2. **Resource-Intensive Process**
- Heavy dependence on creative agencies
- High costs for small and medium advertisers
- Manual workflows prone to errors
- Long turnaround times (days to weeks)

#### 3. **Scalability Issues**
- Multiple formats required: In-store POS, online display ads, social media
- Frequent campaign updates and iterations
- Lack of real-time compliance validation

---

## ✅ Solution

### Intelligent Creative Automation Platform

Our platform leverages **Google Gemini AI** and advanced computer vision to provide following key features:

## ✨ Key Features

### 🎨 **Visual Creative Builder**
- Drag-and-drop interface for composing creatives
- Real-time preview across multiple aspect ratios
- Intuitive design controls for non-technical users

### 🖼️ **AI-Powered Asset Analysis**
- **Pack Shot Detection**: Automatic product image identification
- **Background Removal**: AI-driven accurate background segmentation
- **Object Detection**: Intelligent element recognition and placement
  
### 🎨 **Color Palette Suggestion**
- Storage and suggestion of frequently used color schemes
- Support for custom background colors and images
  
### 🧠 **AI Layout Assistant**
- Context-aware layout Generation across different formats
- Content understanding and optimization

### 📋 **Compliance Validation Engine**
- **Automated Rule Checking**: Validates against all Appendix A & B requirements
- **Detailed Reports**: Pass/fail explanations for every guideline
- **Retailer-Specific Rules**: Logo placement, pricing display, accessibility standards
- **Mismatch-Detection**: Can intelligently identify the mismatch between objects in packshot and Head line/subhead line

### 📐 **Multi-Format Support**
- **1:1** - Social media posts (Instagram, Facebook)
- **16:9** - Online display ads, banners
- **1.9:1** - In-store point-of-sale displays
- Automatically Generates 3 formats at once, Based on choosen ratio automatically resizes the preview panel.

### 📦 **Export & Integration**
- Campaign-ready assets (<150KB)

---

## 🎬 Demo

### Demo Video
🎥 **[Watch Full Demo Video](#)** *(Add your demo video link here)*

### Screenshots

#### Main Interface
![Complete Project UI](#)
*Intuitive creative builder interface with drag-and-drop functionality*

#### Generated Creatives

##### Aspect Ratio 1:1
![Generated Poster - Aspect 1](#)
*Social media ready creative (Instagram/Facebook)*

##### Aspect Ratio 16:9
![Generated Poster - Aspect 2](#)
*Online display ad format*

##### Aspect Ratio 1.9:1
![Generated Poster - Aspect 3](#)
*In-store point-of-sale display*

### 🏗️ System Architecture
![System Architecture]([/assets/System Architecture.png](https://raw.githubusercontent.com/amareshkoneti/Tesco-Project/refs/heads/master/assets/System%20Architecture.png))
*In-store point-of-sale display*

---
## 📁 Project Structure

```
Tesco-Project/
│
├── backend/
│   ├── uploads/                    # Uploaded asset storage
│   ├── utils/                      # Utility modules
│   │   ├── __pycache__/
│   │   ├── __init__.py
│   │   ├── compliance_checker.py  # Compliance validation logic
│   │   ├── gemini_service.py      # Gemini API integration
│   │   ├── image_processor.py     # Image processing functions
│   │   ├── palette_db.py          # Color palette database
│   │   └── palette_routes.py      # Palette API endpoints
│   ├── .env                        # Environment variables
│   ├── app.py                      # Main Flask application
│   ├── palettes.db                 # SQLite database
│   └── requirements.txt            # Python dependencies
│
├── frontend/
│   ├── node_modules/               # Node.js packages
│   ├── public/                     # Static assets
│   ├── src/
│   │   ├── components/             # React components
│   │   │   ├── CompliancePanel.js # Compliance checking UI
│   │   │   ├── ContentForm.js     # Content input form
│   │   │   ├── DesignControls.js  # Design editing controls
│   │   │   ├── ImageUpload.js     # Image upload interface
│   │   │   ├── PaletteSuggestions.js # Color palette UI
│   │   │   └── PreviewPanel.js    # Creative preview
│   │   ├── services/
│   │   │   └── api.js              # API service layer
│   │   ├── App.css                 # Main stylesheet
│   │   └── App.js                  # Root React component
│   ├── package.json                # npm dependencies
│   └── package-lock.json
│
└── README.md                        # This file
```
---

## 🧰 Tech Stack

### **Frontend**
- **React.js** - Component-based UI framework
- **HTML5/CSS3** - Modern markup and styling
- **JavaScript** - Interactive functionality
- **html2canvas** - Canvas-based screenshot generation
- **iframe** - Isolated preview rendering

### **Backend**
- **Python 3.x** - Core backend language
- **Flask** - Lightweight web framework
- **REST APIs** - Standardized API architecture

### **AI & Machine Learning**
- **Google Gemini API** - Advanced language and vision AI
- **Prompt Engineering** - Optimized AI interactions
- **OpenCV** - Computer vision processing
- **Image Analysis** - Deep learning-based image understanding
- **AI Powered Compliance Engine** - Utilized Gemini for Validating Compilance rules

### **Database**
- **SQLite** - Lightweight relational database for palette storage

### **Development Tools**
- **Git & GitHub** - Version control and collaboration
- **npm** - JavaScript package management
- **pip** - Python package management

---

## 🚀 Installation & Setup

### Prerequisites

- **Node.js** (v14.0 or higher)
- **Python** (v3.8 or higher)
- **npm** or **yarn**
- **Git**
- **Google Gemini API Key**

### Step 1: Clone the Repository

```bash
git clone https://github.com/amareshkoneti/Tesco-Project.git
cd Tesco-Project
```

### Step 2: Get Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/api-keys)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy your API key

### Step 3: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure API key
# Open app.py and add your API key around line 50:
# GEMINI_API_KEY = "YOUR_GEMINI_API_KEY_HERE"

# Run backend server
python app.py
```

**Backend will be running at:** `http://localhost:5000`

### Step 4: Frontend Setup

Open a **new terminal** window:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

**Frontend will be running at:** `http://localhost:3000`

### Step 5: Verify Installation

1. Open your browser and navigate to `http://localhost:3000`
2. You should see the Creative Builder interface
3. Try uploading a sample image to test the system

---

## 📖 Usage Guide

### 1. **Upload Assets**
- Click the upload button to add product pack shots or logos
- The AI automatically detects and processes the image
- Background removal is applied automatically

### 2. **Design Your Creative**
- Add text, adjust colors.
- Choose from suggested color palettes
- Generate your Create Automatically in 3 different formats

### 3. **Export**
- Click "Export Creative" to generate final assets
- Choose format (PNG, JPG, PDF)
- Download campaign-ready files (<500KB)

---

## 👥 Team

<table>
  <tr>
    <td align="center">
      <br />
      <sub><b>Veerla Sailaja</b></sub>
      <br />
      <sub>Team Leader, AIML Engineer</sub>
      <br />
    </td>
    <td align="center">
      <br />
      <sub><b>Amaresh Koneti</b></sub>
      <br />
      <sub>Backend Developer</sub>
      <br />
    </td>
    <td align="center">
      <br />
      <sub><b>Pedamallu Umesh Gupta</b></sub>
      <br />
      <sub>Frontend Developer</sub>
      <br />
    </td>
  </tr>
  <tr>
    <td align="center">
      <br />
      <sub><b>Karthik Pasupuleti</b></sub>
      <br />
      <sub>Frontend Developer</sub>
      <br />
    </td>
    <td align="center">
      <br />
      <sub><b>Jaswanth Krishna Perla</b></sub>
      <br />
      <sub>Full Stack Developer</sub>
      <br />
    </td>
  </tr>
</table>

---

## Acknowledgments

- **Google Gemini** for providing cutting-edge AI capabilities
- **Tesco** for inspiration in retail media guidelines
- **Open Source Community** for amazing tools and libraries
- **Hackathon Organizers** for this incredible opportunity

---

## 📧 Contact

For questions, suggestions, or collaboration opportunities:

- **Email**: [veerlasailajayadav@gmail.com](mailto:veerlasailajayadav@gmail.com)
- **Project Repository**: [GitHub](https://github.com/amareshkoneti/Tesco-Project)

---

<div align="center">

**Made with ❤️ by Team**

⭐ Star this repository if you find it helpful!

[⬆ Back to Top](#-ai-powered-retail-media-creative-builder--compliance-engine)

</div>
