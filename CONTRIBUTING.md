# Contributing to School Management System

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## 🚀 Getting Started

1. **Fork the Repository**
   ```bash
   # Click "Fork" on GitHub
   git clone https://github.com/your-username/school-management-system.git
   cd school-management-system
   ```

2. **Set Up Development Environment**
   - Follow instructions in [README.md](./README.md)
   - Install dependencies for both client and server
   - Set up environment variables

3. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

---

## 📝 Code Style

### JavaScript
- Use ES6+ syntax
- 2 spaces for indentation
- Semicolons required
- Single quotes for strings
- No `console.log` in production code

### React
- Functional components with hooks
- Use React Hook Form + Zod for forms
- Use shadcn/ui components
- Keep components small and focused

### Backend
- Controllers handle routes
- Services handle business logic
- Use Prisma for database queries
- Always use asyncHandler wrapper
- Follow REST API conventions

---

## 🧪 Testing

Before submitting a PR:

```bash
# Run linting
cd client && npm run lint
cd server && npm run lint

# Run tests (when available)
cd client && npm test
cd server && npm test

# Build frontend to check for errors
cd client && npm run build
```

---

## 📋 Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
feat: add student bulk import feature
fix: resolve fee calculation bug
docs: update deployment guide
style: format code with prettier
refactor: simplify authentication logic
test: add tests for student controller
chore: update dependencies
```

---

## 🔀 Pull Request Process

1. **Update Documentation**
   - Update README if needed
   - Add JSDoc comments for new functions
   - Update API documentation

2. **Test Your Changes**
   - Test manually in development
   - Verify on multiple browsers
   - Check mobile responsiveness

3. **Create Pull Request**
   - Use a clear, descriptive title
   - Reference related issues
   - Describe what changed and why
   - Include screenshots for UI changes

4. **PR Template**
   ```markdown
   ## Description
   Brief description of changes
   
   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update
   
   ## Testing
   How did you test this?
   
   ## Screenshots (if applicable)
   Add screenshots here
   
   ## Checklist
   - [ ] Code follows style guidelines
   - [ ] Self-review completed
   - [ ] Comments added for complex code
   - [ ] Documentation updated
   - [ ] No new warnings
   - [ ] Tests added/updated
   ```

---

## 🐛 Bug Reports

Use the GitHub issue template:

```markdown
**Describe the bug**
A clear description of the bug

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen

**Screenshots**
If applicable, add screenshots

**Environment:**
 - OS: [e.g. Windows 11]
 - Browser: [e.g. Chrome 120]
 - Version: [e.g. 1.0.0]

**Additional context**
Any other relevant information
```

---

## 💡 Feature Requests

Use the GitHub issue template:

```markdown
**Is your feature request related to a problem?**
A clear description of the problem

**Describe the solution you'd like**
What you want to happen

**Describe alternatives you've considered**
Other solutions you've thought about

**Additional context**
Screenshots, mockups, or examples
```

---

## 📁 Project Structure

```
client/src/
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── layout/          # Layout components
│   ├── forms/           # Form components
│   └── shared/          # Shared components
├── pages/               # Page components
├── hooks/               # Custom hooks
├── lib/                 # Utilities
└── context/             # React context

server/src/
├── config/              # Configuration
├── controllers/         # Route handlers
├── middleware/          # Express middleware
├── routes/              # API routes
├── services/            # Business logic
└── utils/               # Utilities
```

---

## 🔒 Security

- Never commit `.env` files
- Don't include API keys in code
- Report security issues privately
- See [SECURITY.md](./SECURITY.md)

---

## ✅ Code Review Checklist

Before requesting review:

- [ ] Code follows project style
- [ ] No console.log statements
- [ ] Error handling included
- [ ] Loading states added
- [ ] Success/error messages shown
- [ ] Mobile responsive
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Tested in development
- [ ] Documentation updated

---

## 📚 Resources

- [React Documentation](https://react.dev)
- [Express Documentation](https://expressjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [TailwindCSS](https://tailwindcss.com)

---

## 🎯 Priority Areas

We especially welcome contributions in:

1. **Testing** - Unit and integration tests
2. **Documentation** - User guides and tutorials
3. **Accessibility** - ARIA labels and keyboard navigation
4. **Performance** - Optimization and caching
5. **Mobile** - Mobile UX improvements

---

## ❓ Questions?

- Open a GitHub Discussion
- Email: your.email@example.com
- Check existing issues and PRs

---

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing! 🙏**
