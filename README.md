# Music Station

![Logo](./public/images/icon.png)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14+-black)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6+-blue)](https://www.prisma.io/)

A self-hosted music streaming server built with Next.js, Prisma, and SQLite. It allows you to manage and stream your personal music collection from anywhere, with a modern web interface.

## Features

- **Self-hosted**: Run your own music server on your hardware
- **Modern UI**: Built with Next.js, TypeScript, and Tailwind CSS using Radix UI components
- **Audio Streaming**: Stream high-quality audio files (FLAC, MP3, etc.) with Wavesurfer.js
- **Library Management**: Organize your music by artists, albums, genres, and playlists
- **User Authentication**: Secure login system with session management
- **Favorites & Playlists**: Create custom playlists and mark favorite tracks
- **Responsive Design**: Works on desktop and mobile devices
- **Docker Support**: Easy deployment with Docker
- **API**: RESTful API for integration with other tools
- **Testing**: Comprehensive test suite with Vitest and Playwright
- **Internationalization**: Multi-language support (English and Chinese)

## Prerequisites

- Node.js 18.0.0 or higher
- pnpm (recommended) or npm/yarn
- SQLite (included with Prisma)

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/music-station.git
   cd music-station
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   Copy the example environment file and configure it:
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your settings (see Configuration section below).

4. **Set up the database**
   ```bash
   pnpm run prisma
   ```

5. **Start the development server**
   ```bash
   pnpm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Configuration

Create a `.env.local` file in the root directory with the following variables:

```bash
# Storage directory for tracks and database (default: "data")
NEXT_PUBLIC_STORAGE_PREFIX="/path/to/your/music/storage"

# Number of salt rounds for password hashing (default: 12)
NEXT_PUBLIC_BCRYPT_SALT_ROUNDS=12

# Database URL for SQLite
DATABASE_URL="file:./data/library.db"

# Secret key for session management (generate with: openssl rand -base64 32)
SESSION_SECRET="your_secure_session_secret_here"
```

### Environment Variables

- `NEXT_PUBLIC_STORAGE_PREFIX`: Absolute path to store music files and database. Default is `./data`.
- `NEXT_PUBLIC_BCRYPT_SALT_ROUNDS`: Salt rounds for password hashing. Higher values are more secure but slower.
- `DATABASE_URL`: SQLite database file location.
- `SESSION_SECRET`: Random string for encrypting sessions. Keep this secret!

## Usage

1. **Add Music**: Place your music files in the storage directory specified by `NEXT_PUBLIC_STORAGE_PREFIX`.
2. **Scan Library**: The app will automatically scan and index your music files.
3. **Create Account**: Register a user account to access the interface.
4. **Browse & Play**: Use the web interface to browse artists, albums, genres, and playlists.
5. **Create Playlists**: Organize your music into custom playlists.
6. **Stream**: Play music directly in your browser with high-quality streaming.

## Development

### Scripts

- `pnpm run dev` - Start development server with Turbopack
- `pnpm run build` - Build for production
- `pnpm run start` - Start production server
- `pnpm run test` - Run unit tests with Vitest
- `pnpm run playwright` - Run end-to-end tests with Playwright
- `pnpm run lint` - Lint code with ESLint
- `pnpm run check-spelling` - Check spelling with CSpell

### Testing

The project includes both unit tests (Vitest) and end-to-end tests (Playwright).

```bash
# Run unit tests
pnpm run test

# Run E2E tests
pnpm run playwright

# View test reports
pnpm run playwright:report
```

### Docker

Build and run with Docker:

```bash
# Build the image
docker build -t music-station .

# Run the container
docker run -p 3000:3000 -v /path/to/music:/data music-station
```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a pull request

### Guidelines

- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Use conventional commits
- Ensure all tests pass

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [Prisma](https://www.prisma.io/) - Database ORM
- [Shadcn/ui](https://ui.shadcn.com/) - UI components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Radix UI](https://www.radix-ui.com/) - Accessible UI primitives
- [TanStack Query](https://tanstack.com/query/) - Data fetching
- [XState](https://xstate.js.org/) - State management
- [RxJS](https://rxjs.dev/) - Reactive programming

## Support

If you have any questions or need help, please open an issue on GitHub.
