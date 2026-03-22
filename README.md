# Maiki - The Virtual Assistant Operating System

> The world's first Virtual Assistant Operating System. AI-powered marketplace for VAs, clients, and the future of work.

## 🚀 Quick Start

```bash
# Install dependencies
cd frontend/web
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## 📚 Documentation

- [MAIKI_MANIFESTO.md](docs/MAIKI_MANIFESTO.md) - Vision, mission, and 2030 strategy
- [STRESS_TEST_ANALYSIS.md](docs/STRESS_TEST_ANALYSIS.md) - Risk assessment and mitigation
- [MONETIZATION_STRATEGY.md](docs/MONETIZATION_STRATEGY.md) - Revenue models and pricing

## 🏗️ Architecture

### Frontend (Next.js + Tailwind)
- **Framework:** Next.js 14 with App Router
- **Styling:** Tailwind CSS with custom Maiki theme
- **UI Components:** Radix UI primitives + custom components
- **State:** Zustand for global state
- **Animations:** Framer Motion

### Project Structure
```
maiki/
├── frontend/web/          # Next.js application
│   ├── src/
│   │   ├── app/          # App router pages
│   │   ├── components/   # React components
│   │   └── lib/          # Utilities and providers
│   └── ...
├── backend/              # API services (future)
├── docs/                 # Documentation
└── infrastructure/       # Docker, K8s, Terraform
```

## 🎨 Design System

### Colors
- **Primary:** Purple gradient (#8b5cf6 → #6b3eb8)
- **Accent:** Gold (#fbbf24)
- **Background:** Deep purple-black (#0a0514)
- **Glass:** White/5 with backdrop blur

### Components
- `Button` - Multiple variants (default, outline, ghost, glass, gold)
- `Card` - Glassmorphism cards with hover states
- `Badge` - Status indicators with color variants
- `Input` - Dark themed form inputs

## 🛣️ Pages

### Public
- `/` - Landing page with hero, features, pricing
- `/login` - Authentication
- `/register` - Account creation (VA/Client selection)

### Dashboard (VA)
- `/dashboard` - Overview with stats and current jobs
- `/dashboard/jobs` - Job search and listings
- `/dashboard/learn` - Learning center and certifications
- `/dashboard/growth` - Tier progression and requirements
- `/dashboard/earnings` - Payment and transaction history
- `/dashboard/teams` - Guild and team management
- `/dashboard/settings` - Profile and preferences

### Dashboard (Client)
- `/dashboard` - Overview with active projects
- `/dashboard/post-job` - Create job postings
- `/dashboard/va-search` - Find and hire VAs
- `/dashboard/projects` - Project management
- `/dashboard/billing` - Payments and invoices
- `/dashboard/settings` - Company settings

## ✨ Key Features

### For Virtual Assistants
- **6-Tier System:** Apprentice → Legend progression
- **Learning Paths:** Industry-specific courses
- **Skill NFTs:** Blockchain-verified credentials
- **Guild System:** Collective bargaining and community
- **AI Tools:** Built-in agents to multiply productivity

### For Clients
- **AI Matching:** Find perfect VAs in seconds
- **VAaaS:** Managed service for outcomes
- **Verified Profiles:** Background-checked talent
- **Escrow:** Secure payments and dispute resolution

## 📦 Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 14 |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI | Radix UI |
| Animation | Framer Motion |
| Icons | Lucide React |
| State | Zustand |
| Forms | React Hook Form |
| Validation | Zod |

## 🚧 Roadmap

### Phase 1: MVP (Months 1-3)
- [x] Landing page
- [x] Authentication
- [x] Basic dashboard
- [x] Job listings
- [ ] Job application flow
- [ ] Payment integration

### Phase 2: Growth (Months 4-6)
- [ ] Learning module
- [ ] Tier system
- [ ] Reviews and ratings
- [ ] Messaging system

### Phase 3: Scale (Months 7-12)
- [ ] AI matching
- [ ] Guild system
- [ ] NFT skills
- [ ] VAaaS launch

### Phase 4: Innovation (Year 2)
- [ ] $MAIKI token
- [ ] Blockchain reputation
- [ ] AI agents marketplace
- [ ] Enterprise features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Links

- [Website](https://maiki.io) (coming soon)
- [Documentation](docs/)
- [Twitter](https://twitter.com/maiki)

---

<div align="center">

**Built with ❤️ for the 2030 workforce**

*"Work Without Boundaries"*

</div>
