# Development Tools Setup

## 🎯 What's Configured

This project has a **minimal, non-intrusive** development tools setup:

### ✅ What It Does:

1. **Auto-formats code with Prettier**
   - Runs on file save (if you have VSCode extension)
   - Runs automatically when you commit
   - Uses default Prettier settings (minimal config)

2. **Enforces branch naming**
   - Validates branch names when you push
   - Ensures consistent naming across the team

### ❌ What It Doesn't Do:

- ❌ No commit message validation (write any message you want)
- ❌ No linting checks on commit (ESLint runs in your editor only)
- ❌ No TypeScript type checking on commit
- ❌ No blocking hooks (except branch naming on push)

---

## 🌿 Branch Naming Rules

**Format:** `<type>/<description>`

**Valid types:**

- `feature/` - New features (e.g., `feature/user-login`)
- `fix/` - Bug fixes (e.g., `fix/payment-error`)
- `hotfix/` - Urgent production fixes
- `release/` - Release branches
- `chore/` - Maintenance tasks (e.g., `chore/update-deps`)
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions/updates

**Protected branches** (no validation):

- `main`, `develop`

**Examples:**

```bash
✅ git checkout -b feature/oauth-login
✅ git checkout -b fix/navbar-responsive
✅ git checkout -b chore/update-dependencies
❌ git checkout -b my-feature (invalid)
❌ git checkout -b Feature/Login (invalid - must be lowercase)
```

---

## 🎨 Prettier Formatting

### Auto-format on save:

1. Install VSCode extension: `Prettier - Code formatter`
2. Save any file → automatically formatted ✨

### Manual formatting:

```bash
# Format all files
npm run format

# Check if files are formatted (doesn't change files)
npm run format:check
```

### Prettier settings (minimal):

- Single quotes: `'hello'` instead of `"hello"`
- Trailing commas in ES5 (objects, arrays)
- All other settings are Prettier defaults

---

## 🚀 Workflow

### Creating a new branch:

```bash
# Create feature branch
git checkout -b feature/my-awesome-feature

# Work on your code...
# Files auto-format on save ✨

# Stage and commit
git add .
git commit -m "Add awesome feature"
# → Prettier runs automatically on staged files

# Push (branch name validated here)
git push origin feature/my-awesome-feature
```

### If branch name is invalid:

```bash
# Rename your branch
git branch -m feature/correct-name

# Then push
git push origin feature/correct-name
```

---

## 📦 Installed Packages

```json
{
  "prettier": "Auto-formatter",
  "lint-staged": "Runs prettier on staged files only",
  "husky": "Git hooks manager"
}
```

**Note:** `commitlint`, `commitizen`, and `eslint-config-prettier` were installed but are not actively used. They're available if you want to enable stricter checks later.

---

## 💡 Tips

### Bypass formatting (emergency only):

```bash
git commit --no-verify -m "emergency fix"
```

### Disable auto-format in specific files:

Add to `.prettierignore`:

```
# Ignore specific file
src/legacy-code.js

# Ignore folder
legacy/
```

---

## 🐛 Troubleshooting

**Prettier not formatting on save?**

1. Install VSCode extension: `esbenp.prettier-vscode`
2. Reload VSCode: `Ctrl+Shift+P` → "Reload Window"
3. Check `.prettierrc.json` exists in root

**Git hooks not working?**

```bash
# Check .husky folder exists
ls -la .husky/

# If missing, reinstall
rm -rf .husky node_modules
npm install
```

**Branch validation not working?**

```bash
# Make hook executable
chmod +x .husky/pre-push
```

---

## 🔧 Need Stricter Rules?

If you want to enable stricter checks later:

- ✅ Commit message validation (commitlint is already installed)
- ✅ Lint checks on commit
- ✅ TypeScript type checking

Just ask and I can configure them! 🚀
