# AGENTS.md - Agent Coding Guidelines for ReservaT Landing Page

## Overview

This is a React 18 landing page application for ReservaT, a tourism service platform. It uses Create React App with TailwindCSS for styling.

## Build, Lint, and Test Commands

### Development
```bash
npm start          # Start development server on localhost:3000
```

### Production
```bash
npm run build      # Build for production (outputs to /build)
```

### Testing
```bash
npm test           # Run all tests in interactive watch mode
npm test -- --watchAll=false    # Run all tests once (CI mode)
npm test -- --testPathPattern=ComponentName  # Run single test file
npm test -- --testNamePattern="test name"    # Run single test by name
```

### Other
```bash
npm run eject      # Eject from react-scripts (irreversible)
```

## Code Style Guidelines

### General Conventions

- **Language**: JavaScript (ES6+) - NOT TypeScript
- **Framework**: React 18 with hooks
- **Styling**: TailwindCSS
- **File Extension**: `.js` for components, `.jsx` for components with JSX

### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Components | PascalCase | `ServiceCard.js`, `LoginModal.js` |
| Hooks | camelCase starting with use | `useAuth.js`, `useCart.js` |
| Context | PascalCase with Context | `AppContext.js` |
| Utilities | camelCase | `api.js`, `helpers.js` |
| CSS Classes | kebab-case | `btn-primary`, `service-card` |

### File Structure

```
src/
├── components/          # React components
│   ├── Header.js
│   ├── SearchBanner.js
│   ├── ServicesList.js
│   ├── ServiceCard.js
│   ├── ServiceModal.js
│   ├── ServiceMap.js
│   ├── LoginModal.js
│   └── Cart.js
├── context/            # React Context providers
│   └── AppContext.js
├── App.js              # Main app component
├── index.js            # Entry point
└── index.css           # Global styles + Tailwind
```

### Imports Order

1. React imports (`react`)
2. External libraries (`react-router-dom`, `lucide-react`, etc.)
3. Context/Providers
4. Components
5. Utils/Helpers
6. CSS/Styles

```javascript
// Example import order
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, MapPin, Star } from 'lucide-react'
import AppContext from './context/AppContext'
import ServiceCard from './components/ServiceCard'
import { formatPrice, truncateText } from './utils/helpers'
import './index.css'
```

### Component Structure

```javascript
import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

function ComponentName({ prop1, prop2 }) {
  const [state, setState] = useState(null)

  useEffect(() => {
    // side effects
  }, [dependencies])

  const handleEvent = () => {
    // event handlers
  }

  return (
    <div className="component-name">
      {/* JSX */}
    </div>
  )
}

ComponentName.propTypes = {
  prop1: PropTypes.string.isRequired,
  prop2: PropTypes.number
}

export default ComponentName
```

### TailwindCSS Guidelines

- Use Tailwind utility classes for all styling
- Custom colors defined in `tailwind.config.js`:
  - Primary: `#263DBF`
  - Secondary: `#2E3C8C`
  - Tertiary: `#264CBF`
  - Pink: `#D9779B`
  - Orange: `#F2785C`
- Use semantic class names: `btn-primary`, `input-field`, `card`
- Responsive: `md:`, `lg:` prefixes for tablet/desktop

### Error Handling

- Use try-catch for async operations
- Display user-friendly error messages via SweetAlert2
- Log errors to console for debugging
- Show loading states during async operations

```javascript
try {
  setLoading(true)
  const data = await fetchData()
  setData(data)
} catch (error) {
  console.error('Error fetching data:', error)
  Swal.fire({
    icon: 'error',
    title: 'Error',
    text: 'Failed to load data. Please try again.'
  })
} finally {
  setLoading(false)
}
```

### State Management

- Use React Context (`AppContext`) for global state (auth, cart)
- Use local useState for component-specific state
- Use useEffect for side effects and subscriptions

### API Integration

- Base API URL: `https://back-services.api-reservat.com/api/v1/`
- Authentication endpoints:
  - Login: `/usuarios/login`
  - Services: `/servicios/listar/`
  - User: `/mayorista/consultar/{id}`
- Use js-cookie for JWT token storage
- Handle token expiration gracefully

### Accessibility

- Use semantic HTML elements
- Include alt text for images
- Ensure proper contrast ratios
- Support keyboard navigation

## Additional Guidelines

### Icons
- Use `lucide-react` for all icons
- Import only needed icons to reduce bundle size

### Maps
- Use `react-leaflet` for map integration
- Handle loading states for map components

### Performance
- Memoize expensive computations with useMemo
- Use React.lazy for code splitting if needed
- Optimize images and assets

## Skill Files Reference

This project has skill files that provide additional guidance:

- `.agents/skills/vercel-react-best-practices/SKILL.md` - React performance optimization
- `.agents/skills/frontend-design/SKILL.md` - Frontend design guidelines
- `.agents/skills/web-design-guidelines/SKILL.md` - Web accessibility and UX best practices
