# Frontend Design Document

## Architecture Overview

The BlokDeprem frontend will follow a modern, scalable architecture designed for emergency response scenarios where reliability and performance are critical.

## System Architecture

### Technology Stack Decisions

**React 18 + TypeScript**
- Chosen for strong typing, component reusability, and ecosystem maturity
- TypeScript ensures API contract consistency and reduces runtime errors
- React 18 provides concurrent features for better performance

**Vite**
- Lightning-fast development server and HMR
- Optimized build process with modern tooling
- Excellent TypeScript integration

**Tailwind CSS + Headless UI**
- Utility-first CSS for rapid development
- Consistent design system with accessibility built-in
- Highly customizable without writing custom CSS

**Zustand for State Management**
- Lightweight alternative to Redux
- TypeScript-friendly with minimal boilerplate
- Good performance for our state management needs

### Project Structure

```
frontend/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── ui/              # Basic UI primitives
│   │   ├── forms/           # Form components
│   │   └── layout/          # Layout components
│   ├── pages/               # Route components
│   │   ├── public/          # Public pages
│   │   ├── official/        # Official pages
│   │   └── admin/           # Admin pages
│   ├── hooks/               # Custom React hooks
│   ├── services/            # API and external services
│   ├── stores/              # Zustand stores
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Utility functions
│   ├── constants/           # Application constants
│   └── assets/              # Static assets
```

## Component Architecture

### Design Principles

1. **Component Composition**: Build complex UIs from simple, reusable components
2. **Presentational vs Container**: Separate logic from presentation
3. **Props Interface**: Clear TypeScript interfaces for all component props
4. **Error Boundaries**: Graceful error handling throughout the app

### Component Hierarchy

```
App
├── Router
├── AuthProvider
├── QueryProvider
└── Layout
    ├── Header
    ├── Sidebar
    └── MainContent
        └── PageComponents
```

## State Management Strategy

### Global State (Zustand)

**Auth Store**
```typescript
interface AuthState {
  user: User | null
  token: string | null
  isConnected: boolean
  role: UserRole | null
  login: (walletAddress: string) => Promise<void>
  logout: () => void
}
```

**UI Store**
```typescript
interface UIState {
  theme: 'light' | 'dark'
  language: 'tr' | 'en'
  sidebarOpen: boolean
  notifications: Notification[]
  setTheme: (theme: Theme) => void
  setLanguage: (lang: Language) => void
}
```

### Local State
- Form state using React Hook Form
- Component-specific state with useState
- Server state with React Query (TanStack Query)

## API Integration Architecture

### Service Layer Design

**Base API Client**
```typescript
class ApiClient {
  private axios: AxiosInstance
  constructor() {
    this.axios = axios.create({
      baseURL: import.meta.env.VITE_API_URL
    })
    this.setupInterceptors()
  }
}
```

**Service Modules**
- `AuthService`: Authentication and authorization
- `ShipmentsService`: Shipment CRUD operations
- `NeedsService`: Needs management
- `TrackingService`: Shipment tracking
- `LocationsService`: Location data
- `AIService`: AI-powered suggestions

### Error Handling Strategy

1. **Global Error Boundary**: Catch unexpected errors
2. **API Error Interceptors**: Handle HTTP errors consistently
3. **Form Validation**: Client-side validation with Zod
4. **User Notifications**: Toast notifications for user feedback

## Routing Strategy

### Route Structure

```typescript
const routes = [
  { path: '/', element: <HomePage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/needs', element: <NeedsPage /> },
  { path: '/track/:barcode', element: <TrackPage /> },
  {
    path: '/official',
    element: <ProtectedRoute role="official" />,
    children: [
      { path: 'dashboard', element: <OfficialDashboard /> },
      { path: 'shipments', element: <ShipmentManagement /> }
    ]
  },
  {
    path: '/admin',
    element: <ProtectedRoute role="admin" />,
    children: [
      { path: 'dashboard', element: <AdminDashboard /> },
      { path: 'locations', element: <LocationManagement /> },
      { path: 'officials', element: <OfficialManagement /> }
    ]
  }
]
```

### Navigation Design

- **Public Navigation**: Simple, focused on core features
- **Official Navigation**: Comprehensive management tools
- **Admin Navigation**: Full system administration

## Security Considerations

### Authentication Flow

1. **Wallet Connection**: MetaMask integration
2. **Message Signing**: Cryptographic proof of ownership
3. **JWT Token**: Secure session management
4. **Token Refresh**: Automatic token renewal

### Data Protection

- **Input Validation**: All user inputs validated on client and server
- **XSS Prevention**: Proper data sanitization
- **CSRF Protection**: SameSite cookies and CSRF tokens
- **Secure Storage**: Sensitive data in httpOnly cookies

## Performance Optimization

### Code Splitting

- **Route-based splitting**: Lazy load page components
- **Component-based splitting**: Heavy components on demand
- **Vendor splitting**: Separate vendor bundles

### Caching Strategy

- **API Caching**: React Query for server state
- **Asset Caching**: Service worker for static assets
- **Browser Caching**: Proper cache headers

### Bundle Optimization

- **Tree shaking**: Remove unused code
- **Minification**: Production bundle optimization
- **Compression**: Gzip/Brotli compression

## Accessibility Strategy

### WCAG 2.1 Compliance

- **Semantic HTML**: Proper use of HTML5 elements
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: ARIA labels and descriptions
- **Color Contrast**: WCAG AA contrast ratios

### Responsive Design

- **Mobile-First**: Design for mobile devices first
- **Touch Targets**: Minimum 44px touch targets
- **Text Scaling**: Support for text resizing
- **Orientation**: Support for portrait and landscape

## Testing Strategy

### Unit Testing (Vitest + React Testing Library)

- **Component Tests**: Individual component behavior
- **Hook Tests**: Custom hook functionality
- **Utility Tests**: Helper function validation

### Integration Testing

- **API Integration**: Service layer testing
- **Form Integration**: Form submission and validation
- **Navigation Tests**: Route behavior

### E2E Testing (Playwright)

- **User Workflows**: Critical user journeys
- **Authentication Flow**: Login/logout scenarios
- **Data Flow**: End-to-end data operations

## Internationalization

### Multi-Language Support

- **React i18next**: Internationalization framework
- **Namespace Organization**: Logical grouping of translations
- **Dynamic Loading**: Load translations on demand
- **RTL Support**: Right-to-left language support

### Translation Management

- **Key Naming Convention**: Consistent translation keys
- **Pluralization**: Handle plural forms correctly
- **Date/Time Formatting**: Localized date and time
- **Number Formatting**: Localized number and currency

## Deployment Strategy

### Build Configuration

- **Environment Variables**: Secure configuration management
- **Asset Optimization**: Image and asset optimization
- **Source Maps**: Production source maps for debugging

### Hosting Considerations

- **Static Hosting**: CDN deployment for static assets
- **API Proxy**: Development proxy configuration
- **HTTPS**: Secure production deployment
- **Performance Monitoring**: Runtime performance tracking

This design provides a solid foundation for building a reliable, performant, and maintainable frontend application that meets the critical requirements of an emergency response system.