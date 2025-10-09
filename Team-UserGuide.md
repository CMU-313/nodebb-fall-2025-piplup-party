# NodeBB Team Features - Documentation Index

This document provides an overview of all features implemented by the team and links to detailed documentation for each feature.

## 📋 Available Features

### 1. Urgent Topic Counter
**Contributor**: [Team Member Name]  
**Status**: ✅ Implemented & Tested  
**Description**: Visual indicator showing the number of urgent topics in each category on the categories page.

**Key Features**:
- Red/grey badges showing urgent topic counts
- Mobile and desktop responsive design
- Real-time count updates
- API integration

**📖 Full Documentation**: See `UserGuide-Urgent-Counter.md` for complete details

---

### 2. Urgent Topics Filter
**Contributor**: [Your Name]  
**Status**: ✅ Implemented & Tested  
**Description**: Filter to show only urgent topics within category views with dropdown/toggle UI.

**Key Features**:
- Dropdown filter in topic list bar
- "All Topics" vs "Urgent Only" views
- URL parameter support (`?filter=urgent`)
- Integration with sorting and pagination
- Comprehensive test suite (72 test cases)

**📖 Full Documentation**: See `UserGuide-Urgent-Filtering.md` for complete details

---

### 3. [Feature Name 3]
**Contributor**: [Team Member Name]  
**Status**: [Status]  
**Description**: [Brief description]

**📖 Full Documentation**: See `UserGuide-[Feature-Name].md` for complete details

---

## 🧪 Running Tests

To test all team features:

```bash
# Run all tests
npm test

# Run specific feature tests
npm test -- --grep "Urgent Filter"    # Urgent Topics Filter
npm test -- --grep "Urgent Counter"   # Urgent Topic Counter
# Add more feature-specific test commands as needed
```

## 📊 Test Coverage Summary

| Feature | Test Files | Test Cases | Status |
|---------|------------|------------|---------|
| Urgent Topic Counter | `test/categories.js` | 8 tests | ✅ Passing |
| Urgent Topics Filter | 4 test files | 72 tests | ✅ Passing |
| [Feature 3] | [test files] | [count] | [status] |

## 🚀 Quick Start Guide

1. **Start NodeBB**: `./nodebb start`
2. **Access Features**:
   - Categories page: `http://localhost:4567/categories` (Urgent Counter)
   - Category view: `http://localhost:4567/category/[id]` (Urgent Filter)
3. **Test Features**: Follow the testing guides in each feature's documentation

## 📝 Contributing

When adding new features:

1. Create a dedicated `UserGuide-[Feature-Name].md` file
2. Add your feature to this index
3. Include comprehensive tests
4. Update this README with test coverage info

## 🔗 Links

- **Main Documentation**: Each feature has its own detailed guide
- **API Documentation**: Available at `/api/v3/` endpoints
- **Test Coverage**: Run `npm run test:coverage` for detailed reports

---

**Last Updated**: October 9, 2025  
**Team Features**: 2 implemented, more coming soon!