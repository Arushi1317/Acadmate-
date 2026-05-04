# 🚀 Installation & Setup Guide

## Quick Start (5 Minutes)

### Step 1: Navigate to the Project
```bash
cd outputs/
```

### Step 2: Install Dependencies
```bash
npm install
```
This installs all required packages (React, Tailwind, etc.)

### Step 3: Start Development Server
```bash
npm run dev
```

### Step 4: Open in Browser
- The server will output a URL (usually `http://localhost:5173`)
- Open this URL in your web browser
- Your AcadMate dashboard is ready!

---

## System Requirements

### Minimum
- Node.js 16+
- npm 8+ or yarn 3+
- Modern web browser (Chrome, Firefox, Safari, Edge)
- 2GB free disk space

### Recommended
- Node.js 18+
- npm 9+
- Chrome 90+ or Firefox 88+
- 4GB free disk space

---

## Full Installation Guide

### For Windows

#### 1. Install Node.js
- Download from [nodejs.org](https://nodejs.org)
- Run the installer
- Choose "Add to PATH" during installation
- Restart your computer

#### 2. Open Command Prompt
- Press `Win + R`
- Type `cmd`
- Press Enter

#### 3. Install Project
```cmd
cd path\to\outputs
npm install
npm run dev
```

### For macOS

#### 1. Install Node.js
```bash
# Using Homebrew (recommended)
brew install node

# Or download from nodejs.org
```

#### 2. Open Terminal
- Press `Cmd + Space`
- Type `terminal`
- Press Enter

#### 3. Install Project
```bash
cd path/to/outputs
npm install
npm run dev
```

### For Linux

#### 1. Install Node.js
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nodejs npm

# Fedora
sudo dnf install nodejs npm

# Arch
sudo pacman -S nodejs npm
```

#### 2. Install Project
```bash
cd path/to/outputs
npm install
npm run dev
```

---

## Verify Installation

After running `npm run dev`, you should see:

```
  VITE v7.2.4  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  press h + enter to show help
```

Open the URL in your browser. If you see the AcadMate dashboard, you're all set! ✅

---

## Available Commands

### Development
```bash
npm run dev      # Start development server with hot reload
```

### Production Build
```bash
npm run build    # Create optimized build in dist/ folder
npm run preview  # Preview the production build
```

### Other Commands
```bash
npm list         # Show installed packages
npm outdated     # Check for outdated packages
npm update       # Update packages
npm cache clean  # Clear npm cache
```

---

## Build for Production

### Step 1: Create Build
```bash
npm run build
```

This creates an optimized `dist/` folder with all files.

### Step 2: Upload to Hosting

The `dist/` folder contains everything needed:
- `index.html` - Main file
- `assets/` - JavaScript, CSS, images

Upload entire `dist/` folder to:
- **Vercel** - Auto-deploy from GitHub
- **Netlify** - Drop and drop `dist/` folder
- **GitHub Pages** - Push to gh-pages branch
- **Any hosting** - FTP/SSH upload

### Step 3: Test Live Version
Visit your hosted URL and verify everything works!

---

## Troubleshooting

### "npm: command not found"
**Solution**: Node.js isn't installed or not in PATH
- Reinstall Node.js
- Restart your terminal
- Verify with: `node --version`

### "port 5173 already in use"
**Solution**: Another app is using port 5173
```bash
# Kill the process on port 5173
# Windows: netstat -ano | findstr :5173
# Mac/Linux: lsof -i :5173 | kill -9

# Or use a different port:
npm run dev -- --port 3000
```

### "Module not found" errors
**Solution**: Dependencies not installed
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### "styles not showing"
**Solution**: Clear browser cache
- Chrome: Ctrl + Shift + Delete
- Firefox: Ctrl + Shift + Delete
- Safari: Develop menu → Clear Caches

### "data disappeared"
**Solution**: Check browser storage
- Chrome DevTools → Application → Local Storage
- Should see entries starting with "acadmate-"

---

## Browser Support

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 90+ | ✅ Full |
| Firefox | 88+ | ✅ Full |
| Safari | 14+ | ✅ Full |
| Edge | 90+ | ✅ Full |
| Opera | 76+ | ✅ Full |

---

## File Structure After Installation

```
outputs/
├── node_modules/          # Installed packages (created by npm install)
├── src/
│   ├── App.tsx           # Main component
│   ├── index.css         # Global styles
│   ├── main.tsx          # Entry point
│   └── utils/
│       └── cn.ts         # Utilities
├── public/               # Static files
├── dist/                 # Build output (created by npm run build)
├── index.html            # HTML template
├── package.json          # Project config
├── tsconfig.json         # TypeScript config
├── vite.config.ts        # Build config
├── README.md             # Project overview
└── *.md                  # Documentation files
```

---

## Environment Setup

### Visual Studio Code (Recommended)

#### 1. Install VS Code
Download from [code.visualstudio.com](https://code.visualstudio.com)

#### 2. Install Extensions
- "ES7+ React/Redux snippets"
- "Tailwind CSS IntelliSense"
- "Prettier - Code formatter"

#### 3. Open Project
```bash
code outputs/
```

#### 4. Start Dev Server
Press `Ctrl + `` to open terminal in VS Code
```bash
npm run dev
```

### Other Editors

**WebStorm/IntelliJ**
- Open project folder
- Accept suggested "npm install"
- Run configurations available in UI

**Sublime Text**
- Install Node.js support package
- Open folder
- Use terminal for commands

**Vim/Neovim**
- Install Node.js LSP
- Open folder
- Run commands in terminal

---

## Database/Storage

This app uses **browser local storage** only:

### What Gets Stored
- Task list
- Chat history
- User preferences
- Settings

### Where It's Stored
- Saved automatically in browser
- Location: `chrome://system-storage` (Chrome)
- Encrypted by browser
- Never sent to servers

### How to Access in DevTools
1. Open browser DevTools (F12)
2. Go to "Application" tab
3. Find "Local Storage"
4. Look for entries starting with "acadmate-"

---

## Updating the App

### Check for Updates
```bash
npm outdated
```

Shows which packages have newer versions.

### Update All Packages
```bash
npm update
```

Safe way to update everything.

### Update Specific Package
```bash
npm install package-name@latest
```

---

## Performance Optimization

### For Development
- Use modern browser (Chrome recommended)
- Enable "Faster DOM updates" in DevTools
- Close unused tabs
- Clear cache regularly

### For Production
The app is already optimized:
- ✅ Code splitting
- ✅ Tree shaking
- ✅ Minification
- ✅ Compression

No additional optimization needed!

---

## Security Notes

### Your Data is Safe
- ✅ No external servers
- ✅ No cloud sync
- ✅ Local storage only
- ✅ No tracking
- ✅ Open source (review code if desired)

### Best Practices
1. Don't share your browser profile
2. Clear cookies on public computers
3. Use password manager for sensitive data
4. Keep browser updated
5. Avoid public WiFi for sensitive use

---

## Uninstall

### Remove Everything
```bash
# Delete the outputs folder
rm -rf outputs/

# Or on Windows
rmdir /s outputs
```

### Keep Data
Before deleting, export from browser:
- Open DevTools
- Application → Local Storage
- Copy "acadmate-tasks" and "acadmate-chats"
- Save to text file

---

## Getting Help

### Documentation Files
1. **README.md** - Project overview
2. **QUICK_START_GUIDE.md** - How to use
3. **DESIGN_SPECIFICATION.md** - Design details
4. **COMPLETE_CHANGELOG.md** - All changes

### Common Resources
- [React Docs](https://react.dev)
- [Tailwind Docs](https://tailwindcss.com)
- [Vite Docs](https://vitejs.dev)

---

## Success Checklist

- [ ] Node.js installed (`node --version` shows version)
- [ ] npm works (`npm --version` shows version)
- [ ] Project folder extracted
- [ ] Ran `npm install`
- [ ] Ran `npm run dev`
- [ ] Browser opened to localhost
- [ ] Dashboard loads and displays
- [ ] Can create a task
- [ ] Can navigate between tabs
- [ ] All styles look correct

**If all checked, you're ready to go!** 🎉

---

## Next Steps

1. ✅ **Read** QUICK_START_GUIDE.md to learn the app
2. 🎨 **Explore** the beautiful new design
3. 📝 **Create** some tasks and test features
4. 🎯 **Customize** colors if desired (optional)
5. 🚀 **Deploy** to production when ready

---

## Support Resources

### For Issues
1. Check the troubleshooting section above
2. Review the documentation files
3. Check browser console for errors (F12)
4. Try clearing cache and restarting

### For Questions
- Review DESIGN_SPECIFICATION.md
- Check COMPLETE_CHANGELOG.md
- Read through inline code comments

---

**Congratulations! Your AcadMate dashboard is installed and ready to use!** 🚀✨

Start by creating your first task and enjoy the beautiful new design! 📚💪
