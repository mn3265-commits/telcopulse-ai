# 🚀 TelcoPulse AI — Complete Deployment Guide


This guide assumes you have **never deployed a Next.js app before**. We'll go slowly.

---

## 📋 Prerequisites Checklist

Before we start, make sure you have:

- [ ] A laptop (Mac or Windows, both work)
- [ ] Internet connection
- [ ] About 2 hours of focused time
- [ ] A coffee ☕

Accounts you'll create (all free to start):

- [ ] **GitHub** account — [sign up here](https://github.com/signup)
- [ ] **Vercel** account — [sign up here](https://vercel.com/signup) (use GitHub login)
- [ ] **Anthropic** account — [sign up here](https://console.anthropic.com) (~$5 credit for testing)

---

## Part 1: Install the tools (20 min)

Think of this like **setting up your kitchen before cooking**. Get the tools ready first.

### 1.1 Install Node.js

Node.js is the "oven" that runs JavaScript.

**Mac:**
```bash
# Open Terminal (Cmd + Space, type "Terminal")
# Install Homebrew first (if you don't have it):
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Then install Node.js:
brew install node

# Verify:
node --version   # Should print v20.x.x or higher
npm --version    # Should print 10.x.x or higher
```

**Windows:**
1. Go to [nodejs.org](https://nodejs.org)
2. Download "LTS" version
3. Run the installer, click Next → Next → Install
4. Open PowerShell and type `node --version` to verify

### 1.2 Install Python (for ML model)

**Mac:**
```bash
brew install python@3.11
python3 --version   # Should print 3.11.x
```

**Windows:**
1. Go to [python.org/downloads](https://python.org/downloads)
2. Download Python 3.11
3. **IMPORTANT:** Check "Add Python to PATH" during install
4. Verify in PowerShell: `python --version`

### 1.3 Install Git

**Mac:** Already installed. Verify: `git --version`

**Windows:** Download from [git-scm.com](https://git-scm.com) and install with defaults.

### 1.4 Install VS Code (recommended editor)

Download from [code.visualstudio.com](https://code.visualstudio.com)

---

## Part 2: Set up the project locally (30 min)

### 2.1 Create the project folder

```bash
# Navigate to your documents folder
cd ~/Documents

# Create a folder for your projects
mkdir projects
cd projects

# Clone this repo (replace with your GitHub username once you fork)
git clone https://github.com/mn3265-commits/telcopulse-ai.git
cd telcopulse-ai
```

### 2.2 Install dependencies

```bash
# Install Node.js packages (takes 2-3 min)
npm install

# You'll see a lot of output. If you see "added X packages" at the end, you're good.
```

### 2.3 Install Python packages

```bash
# Install Python packages for ML
pip install pandas numpy scikit-learn xgboost joblib

# On Mac, you might need:
pip3 install pandas numpy scikit-learn xgboost joblib
```

### 2.4 Get your Claude API key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign in
3. Click **API Keys** in the left sidebar
4. Click **Create Key**
5. Name it "TelcoPulse Dev"
6. **COPY THE KEY IMMEDIATELY** — you won't see it again
7. It looks like: `sk-ant-api03-xxxxxxxxxxxxxx`

### 2.5 Create your environment file

```bash
# Copy the template
cp .env.example .env.local

# Open .env.local in VS Code
code .env.local

# Paste your API key after ANTHROPIC_API_KEY=
# Should look like:
# ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxx

# Save (Cmd+S or Ctrl+S)
```

### 2.6 Generate the dataset and train the model

```bash
# Generate 10,000 synthetic subscribers
python scripts/generate_dataset.py

# You should see:
# ✅ Dataset generated!
# 📊 Total subscribers: 10,000
# 📉 Churn rate: ~30%

# Train the ML model
python scripts/train_model.py

# You should see:
# 🎉 Training complete!
```

### 2.7 Run the app locally

```bash
npm run dev
```

You'll see:
```
▲ Next.js 14.2.13
- Local:        http://localhost:3000
✓ Ready in 2.3s
```

Open your browser to **http://localhost:3000** — **YOU'RE LIVE! 🎉**

---

## Part 3: Push to GitHub (15 min)

### 3.1 Create a new GitHub repo

1. Go to [github.com/new](https://github.com/new)
2. Repository name: `telcopulse-ai`
3. Description: *"AI-powered marketing intelligence for subscription businesses"*
4. Make it **Public** (so recruiters can see)
5. **Do NOT** initialize with README (we already have one)
6. Click **Create repository**

### 3.2 Push your code

GitHub will show you commands. Use these:

```bash
# Set up git (first time only)
git config --global user.name "Mohammad Agung Nugroho"
git config --global user.email "agung.nugroho@columbia.edu"

# Initialize git in the project
git init
git add .
git commit -m "Initial commit: TelcoPulse AI v1.0"

# Connect to GitHub (replace YOUR_USERNAME)
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/telcopulse-ai.git
git push -u origin main
```

Refresh your GitHub page — **your code is live on GitHub! 🎉**

### 3.3 Make your README shine

On GitHub:
1. Click the README.md file
2. Notice how it renders beautifully with badges, sections, etc.
3. This is the first thing recruiters see

---

## Part 4: Deploy to Vercel (20 min)

### 4.1 Import your project

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **Continue with GitHub**
3. Allow Vercel to access your repos
4. Find `telcopulse-ai` and click **Import**

### 4.2 Configure the deployment

1. **Framework:** Next.js (auto-detected)
2. **Build command:** `next build` (default)
3. **Environment Variables** — click "Add":
   - **Required:**
     - `ANTHROPIC_API_KEY` — your Claude API key (`sk-ant-api03-...`)
   - **Optional** (only if you want to enable outbound retention email and voice calls):
     - `GMAIL_ADDRESS` and `GMAIL_APP_PASSWORD` — for Gmail SMTP via Nodemailer (powers `/api/send-email`)
     - `TWILIO_SID`, `TWILIO_TOKEN`, `TWILIO_PHONE_FROM` — for Twilio Voice (powers `/api/send-call`)
4. Click **Deploy**

Wait 2-3 minutes. ⏱️

### 4.3 Your app is LIVE! 🚀

You'll get a URL like: `https://telcopulse-ai.vercel.app`

Click it — your AI app is now on the internet, running 24/7, free.

### 4.4 Add to your resume

In your resume, add:

```
TelcoPulse AI | Personal Project                    github.com/YOU/telcopulse-ai
• Built AI-powered marketing intelligence platform with Next.js 14, Claude API,
  and XGBoost churn prediction model, deployed on Vercel
• Trained ML classifier on 10K synthetic telecom subscribers (18 features)
• Architected multi-step AI reasoning chains for segmentation, campaign generation,
  and impact forecasting
• Live demo: telcopulse-ai.vercel.app
```

---

## Part 5: Polish and iterate (30 min)

### 5.1 Test every feature

Go through each tab on your live site:
- [ ] Churn Radar loads
- [ ] Smart Segments accepts natural language
- [ ] Campaign Writer generates 4 channels
- [ ] Impact Predictor returns predictions

### 5.2 Record a 60-second demo video

Use Loom or screen recording:

**Script:**
> "Hi, I'm Agung. I built TelcoPulse AI — a marketing intelligence platform 
> inspired by my 10 years managing customer lifecycle campaigns at telecoms 
> like Indosat and Smartfren.
> 
> Here's how it works: [click Churn Radar] Real XGBoost model predicts which 
> subscribers will churn. [click Smart Segments] Marketers type in plain English 
> and Claude generates SQL. [click Campaign Writer] One brief becomes 4 channels. 
> [click Impact Predictor] And before sending, we forecast the revenue impact.
> 
> Built with Next.js, Claude API, and trained ML. Link in my profile."

### 5.3 Share it

- **LinkedIn:** Post the video with a story about why you built it
- **Twitter:** Screenshot + link
- **Your internship applications:** Add to portfolio section

---

## 🆘 Troubleshooting

### "npm install" fails
```bash
# Clear cache and try again
rm -rf node_modules package-lock.json
npm install
```

### "Module not found" in Next.js
```bash
# Restart the dev server
# Ctrl+C to stop, then:
npm run dev
```

### API calls return 500 error
- Check your `.env.local` has the correct API key
- Check your Anthropic console has available credits
- Check the terminal where `npm run dev` is running for error details

### Python packages won't install
```bash
# Try with --user flag
pip install --user pandas numpy scikit-learn xgboost joblib
```

### Vercel deployment fails
- Check the "Deployments" tab in Vercel for error logs
- Make sure `ANTHROPIC_API_KEY` environment variable is set
- Try re-deploying: click **Redeploy** in Vercel dashboard

---

## 🎯 Next steps after you deploy

1. **Share it** — LinkedIn, Twitter, internship applications
2. **Iterate** — add features, improve the design, fix bugs
3. **Open Source** — accept contributions, build a following
4. **Write about it** — blog post on Medium about building it
5. **Talk about it in interviews** — this is your conversation starter

---

**Questions?** Open an issue on the GitHub repo or ping me on LinkedIn.

Good luck! 🚀
