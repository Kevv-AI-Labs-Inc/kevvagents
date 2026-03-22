# 🏡 Realtor Profile Template

A modern, open-source single-page profile template for real estate agents. Built with **React 19**, **Express**, **tRPC**, and **Tailwind CSS v4** — designed to be easily customizable for any agent or brokerage.

![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)

## ✨ Features

- **Elegant Split-Screen Layout** — Full-height agent photo on the left, scrollable content on the right (stacked on mobile)
- **Dark / Light Theme** — Built-in theme switching with `next-themes` support
- **Contact Form with Email** — tRPC-powered form that saves to DB and sends notification + confirmation emails
- **Responsive Design** — Fully responsive from mobile to ultrawide
- **Smooth Animations** — Scroll-triggered entry animations via Tailwind CSS `animate-in` utilities
- **50+ shadcn/ui Components** — Pre-installed and ready to use (accordion, dialog, tabs, carousel, and many more)
- **Past Transactions Table** — Showcase closed deals with address, price, and representation details
- **Client Testimonials** — Beautiful quote cards with avatar initials
- **Social Media Links** — Configurable social icons for all platforms
- **SEO-Ready** — Semantic HTML, Google Fonts preconnect, proper meta structure
- **Optional MySQL Database** — Drizzle ORM with graceful fallback when DB is unavailable

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Tailwind CSS v4, Framer Motion |
| **Backend** | Express, tRPC v11, Zod v4 |
| **Database** | MySQL via Drizzle ORM (optional) |
| **UI Library** | shadcn/ui (Radix UI primitives) |
| **Build Tool** | Vite 7, esbuild |
| **Package Manager** | pnpm |
| **Testing** | Vitest |

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **pnpm** ≥ 10 (`npm install -g pnpm`)
- **MySQL** (optional — the app runs without a database)

### Installation

```bash
# Clone the repository
git clone https://github.com/okjusthere/realtor-profile-template.git
cd realtor-profile-template

# Install dependencies
pnpm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
# Database (optional — app works without it)
DATABASE_URL=mysql://user:password@localhost:3306/realtor_profile

# Email (optional — contact form works but won't send emails without these)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-password

# Analytics (optional)
VITE_ANALYTICS_ENDPOINT=https://your-analytics.example.com
VITE_ANALYTICS_WEBSITE_ID=your-website-id
```

### Development

```bash
# Start the development server
pnpm dev
```

The app will be available at `http://localhost:5173` (Vite dev server proxies API requests to Express).

### Build for Production

```bash
# Build both client and server
pnpm build

# Start production server
pnpm start
```

### Database Setup (Optional)

If you want to persist contact form submissions:

```bash
# Generate and run migrations
pnpm db:push
```

## 📁 Project Structure

```
realtor-profile-template/
├── client/                 # Frontend (React SPA)
│   ├── index.html          # HTML entry point
│   ├── public/             # Static assets (images, etc.)
│   └── src/
│       ├── App.tsx          # Root component with routing
│       ├── main.tsx         # React entry point
│       ├── index.css        # Global styles & Tailwind config
│       ├── pages/           # Page components
│       │   └── AgentProfile.tsx  # Main profile page
│       ├── components/      # Reusable components
│       │   ├── ContactForm.tsx
│       │   ├── AIChatBox.tsx
│       │   ├── Map.tsx
│       │   └── ui/          # 50+ shadcn/ui components
│       ├── contexts/        # React contexts (theme, etc.)
│       ├── hooks/           # Custom hooks
│       └── lib/             # Utilities
├── server/                  # Backend (Express + tRPC)
│   ├── routers.ts           # API routes (contact form, auth)
│   ├── db.ts                # Database connection (Drizzle)
│   ├── storage.ts           # File storage (S3)
│   └── _core/               # Core server infrastructure
├── shared/                  # Shared types & constants
├── drizzle/                 # Database schema & migrations
├── vite.config.ts           # Vite configuration
├── drizzle.config.ts        # Drizzle ORM configuration
└── vitest.config.ts         # Test configuration
```

## 🎨 Customization

### 1. Update Agent Information

Edit `client/src/pages/AgentProfile.tsx` to replace:
- Agent name, title, and bio
- Phone number, email, and office address
- Social media links
- Past transactions data
- Client testimonials

### 2. Replace Photos

Drop your agent photo into `client/public/images/` and update the `src` path in `AgentProfile.tsx`.

### 3. Theme & Colors

Modify the CSS variables in `client/src/index.css` to match your brand colors. The template uses HSL color tokens for easy theme customization.

### 4. Contact Form Target

Update the target email and name in `server/routers.ts` to route contact form submissions to the correct recipient.

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Type checking
pnpm check
```

## 📦 Scripts

| Script | Description |
|---|---|
| `pnpm dev` | Start development server with hot reload |
| `pnpm build` | Build for production |
| `pnpm start` | Run production server |
| `pnpm test` | Run tests with Vitest |
| `pnpm check` | TypeScript type checking |
| `pnpm format` | Format code with Prettier |
| `pnpm db:push` | Generate and run database migrations |

## 📄 License

This project is licensed under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Feel free to open issues and pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

Built with ❤️ for the real estate community.
