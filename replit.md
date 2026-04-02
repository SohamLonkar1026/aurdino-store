# ArduinoMart E-commerce Platform

## Overview

ArduinoMart is a full-stack e-commerce web application designed to sell Arduino components and kits. Built as a VIT-based startup project, it features a modern, professional interface with a deep blue Arduino-themed design. The application offers a complete shopping experience with product browsing, cart management, order processing, and administrative controls.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React with TypeScript**: Modern single-page application using React 18+ with full TypeScript support
- **Vite Build System**: Fast development server and optimized production builds
- **shadcn/ui Component Library**: Professional UI components built on Radix UI primitives
- **Tailwind CSS**: Utility-first CSS framework with custom Arduino blue color scheme
- **React Query (TanStack Query)**: Server state management and data fetching
- **Wouter**: Lightweight client-side routing solution

### Backend Architecture
- **Express.js Server**: Node.js backend with TypeScript support
- **RESTful API Design**: Clean API endpoints for orders and contacts
- **Memory Storage**: In-memory data storage (easily replaceable with database)
- **Modular Route Structure**: Organized API routes with proper error handling

### State Management
- **React Context**: Cart management using React Context API with reducer pattern
- **React Query**: Server state caching and synchronization
- **Local Component State**: Form handling and UI state management

## Key Components

### Core Features
1. **Product Catalog**: 43 individual Arduino components plus bundled starter kit
2. **Shopping Cart**: Add/remove items, quantity management, persistent state
3. **Order Management**: Complete checkout flow with customer information
4. **Contact System**: Customer inquiry form with backend storage
5. **Admin Panel**: Order management and status tracking

### Frontend Components
- **Navigation**: Fixed header with slide-based navigation
- **Product Cards**: Interactive product display with quantity selectors
- **Cart Sidebar**: Sliding cart interface with item management
- **Slide System**: Full-screen sections for different pages
- **Form Components**: Checkout and contact forms with validation

### Backend Services
- **Order API**: Create, read, update order status and delete operations
- **Contact API**: Customer message handling
- **Storage Interface**: Abstracted storage layer for easy database integration

## Data Flow

### Order Processing
1. Customer adds items to cart (client-side state)
2. Checkout form submission triggers API call
3. Server validates and stores order data
4. Order confirmation returned to client
5. Cart cleared and user redirected

### Admin Workflow
1. Admin authentication via simple password
2. Fetch all orders from server
3. Display orders in manageable interface
4. Update order status (pending/completed)
5. Real-time updates via React Query invalidation

### Product Management
- Static product catalog defined in client
- Centralized product data structure
- Easy addition of new products via configuration

## External Dependencies

### Frontend Dependencies
- **UI Framework**: React, React DOM, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components, Radix UI primitives
- **State Management**: @tanstack/react-query, React Hook Form
- **Routing**: wouter for client-side navigation
- **Utilities**: clsx, class-variance-authority, date-fns

### Backend Dependencies
- **Server**: Express.js with TypeScript support
- **Database ORM**: Drizzle ORM configured for PostgreSQL
- **Validation**: Zod for schema validation
- **Development**: tsx for TypeScript execution, Vite for frontend

### Database Schema (Drizzle)
- **Orders Table**: Customer details, items, total, status, timestamps
- **Contacts Table**: Customer inquiries with name, email, message
- **PostgreSQL**: Configured but currently using memory storage

## Recent Updates (January 2025)

### Mobile Responsiveness & UI Improvements
- **Fixed homepage images**: Replaced broken external images with custom gradient cards and emoji icons
- **Mobile navigation**: Added hamburger menu with slide-out navigation for mobile devices
- **Responsive layouts**: Improved all page layouts for mobile, tablet, and desktop views
- **Cart sidebar**: Made cart full-width on mobile for better usability
- **Typography scaling**: Implemented responsive text sizes across all components

### Footer Enhancement
- **Company information**: Added comprehensive footer with VIT-based startup details
- **Contact information**: WhatsApp, email, and campus address
- **Quick links**: Navigation to key sections and product categories
- **Policies section**: Placeholder links for shipping, return, privacy policies
- **Mobile-optimized**: Responsive footer design for all screen sizes

### Admin Panel Improvements
- **Contact messages tab**: Added second tab to admin panel for viewing contact form submissions
- **Tabbed interface**: Clean organization with Orders and Contact Messages tabs
- **Message display**: Formatted contact messages with sender info, timestamps, and full message content
- **Mobile responsiveness**: Improved admin panel layout for mobile devices

### Visual Design Updates
- **Consistent iconography**: Replaced external images with custom emoji-based design system
- **Arduino blue theme**: Maintained consistent blue gradient theme throughout
- **Improved spacing**: Better mobile padding and margins across all components
- **Enhanced cards**: Professional gradient cards for product showcases and features

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with Express backend
- **Hot Reloading**: Full-stack development with instant updates
- **TypeScript Compilation**: Real-time type checking across frontend/backend

### Production Build
- **Frontend**: Vite production build with optimized assets
- **Backend**: esbuild bundle for Node.js deployment
- **Static Assets**: Served from Express with proper caching headers

### Database Integration
- **Current**: Memory storage for rapid development
- **Future**: PostgreSQL via Drizzle ORM (configuration ready)
- **Migration Path**: Simple storage interface allows easy database swap

### Deployment Options
- **Replit**: Configured for Replit deployment with custom plugins
- **Docker**: Can be containerized with Node.js base image
- **Cloud Platforms**: Compatible with Vercel, Netlify, Railway, etc.

### Environment Configuration
- **Development**: NODE_ENV=development with debugging enabled
- **Production**: Optimized builds with proper error handling
- **Database URL**: Environment-based PostgreSQL connection string