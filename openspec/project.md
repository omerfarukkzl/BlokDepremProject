# Project Context

## Purpose

BlokDeprem is a blockchain and AI-supported earthquake aid tracking system designed to make post-earthquake aid processes more transparent, fast, and efficient. The system provides:

- **Transparent Tracking**: Blockchain-based immutable tracking of aid materials from collection to delivery
- **Smart Optimization**: AI-powered needs assessment and distribution optimization
- **User-Friendly Interface**: Web and mobile platforms for officials, donors, and administrators
- **Real-time Monitoring**: Live tracking of shipment status and aid distribution

## Tech Stack

### Backend
- **Framework**: NestJS (TypeScript)
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT tokens with crypto wallet-based login
- **API Architecture**: RESTful APIs

### Frontend (Planned)
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand or Redux Toolkit
- **Current**: Legacy HTML/CSS/JS with Bootstrap and jQuery

### Blockchain
- **Platform**: Ethereum
- **Smart Contract Language**: Solidity
- **Integration**: ethers.js or web3.js
- **Test Network**: Sepolia

### AI/ML
- **Language**: Python
- **Libraries**: NumPy, Pandas, Scikit-learn
- **Purpose**: Needs optimization and distribution suggestions

### Development Tools
- **IDE**: Visual Studio Code, Remix IDE (Solidity), Anaconda Spyder
- **Testing**: Jest (unit/e2e), Supertest
- **Code Quality**: ESLint, Prettier, TypeScript

## Project Conventions

### Code Style
- **TypeScript**: Strict mode enabled, proper type definitions
- **Naming**: kebab-case for files, PascalCase for classes, camelCase for variables
- **Database**: snake_case for table/column names
- **API**: RESTful conventions, consistent error handling
- **Blockchain**: Solidity style guide, clear function documentation

### Architecture Patterns
- **Modular Design**: Separate concerns across backend, frontend, blockchain, and AI modules
- **Hybrid Storage**: Operational data in PostgreSQL, critical events on blockchain
- **Event-Driven**: Status changes trigger both database updates and blockchain transactions
- **Microservices-Ready**: Clear separation between aid tracking, authentication, and AI services

### Testing Strategy
- **Unit Tests**: Jest for all business logic components
- **Integration Tests**: API endpoint testing with Supertest
- **E2E Tests**: Complete user flows from frontend to blockchain
- **Smart Contract Tests**: Comprehensive testing of blockchain functions
- **Coverage**: Minimum 80% code coverage required

### Git Workflow
- **Branching**: GitFlow pattern (main, develop, feature branches)
- **Commits**: Conventional commits (feat:, fix:, docs:, etc.)
- **Pull Requests**: Required for all code changes with peer review
- **Semantic Versioning**: Following SemVer for releases

## Domain Context

### System Actors
1. **Officials (Görevli)**: Authorized personnel at aid centers
   - Register shipments with unique barcodes
   - Update shipment status at each stage
   - Crypto wallet authentication required

2. **Donors (Yardımsever)**: Public contributors
   - View location-based needs without registration
   - Track donations using barcode numbers
   - Transparent access to shipment history

3. **Administrators**: System managers
   - Access comprehensive reporting and analytics
   - Manage locations and official accounts
   - Override capabilities for emergency situations

### Core Business Logic
- **Barcode Generation**: Unique identifiers for each shipment
- **Status Tracking**: Registered → InTransit → Delivered
- **Dual Recording**: All status changes saved to database AND blockchain
- **AI Optimization**: Analyze needs vs supply to suggest optimal distribution

### Data Flow
1. Aid received at center → Official registers with barcode
2. Status change → Database update + Blockchain transaction
3. AI analyzes → Distribution suggestions
4. Donor tracks → Real-time status visibility

## Important Constraints

### Technical Constraints
- **Blockchain Gas Fees**: Minimize on-chain transactions to critical events only
- **Data Privacy**: Personal information stored in database, not blockchain
- **Scalability**: System must handle emergency surge capacity
- **Offline Capability**: Aid centers may have limited internet connectivity

### Business Constraints
- **Emergency Response**: System must be available 24/7 during crises
- **Multi-language**: Support Turkish and English interfaces
- **Accessibility**: Must work on low-end mobile devices
- **Regulatory Compliance**: Follow Turkish aid distribution regulations

### Security Constraints
- **Immutable Records**: Blockchain entries cannot be modified once created
- **Access Control**: Strict role-based permissions
- **Audit Trail**: Complete traceability of all aid movements
- **Data Integrity**: Prevention of tampering with aid records

## External Dependencies

### Blockchain Infrastructure
- **Ethereum Network**: Main smart contract deployment
- **Sepolia Testnet**: Development and testing
- **Wallet Providers**: MetaMask or similar for crypto authentication

### External APIs
- **Mapping Services**: For location validation and routing
- **SMS/Email Services**: For notification systems (future)
- **Government APIs**: For official disaster response coordination

### Data Sources
- **Kaggle Datasets**: Historical disaster data for AI training
- **Real-time Feeds**: Weather, seismic activity, and transportation status

### Development Dependencies
- **NPM Registry**: Node.js package management
- **PostgreSQL**: Database hosting (cloud or on-premise)
- **CI/CD**: GitHub Actions or similar for deployment
