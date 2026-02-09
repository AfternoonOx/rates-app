# Currency & Gold Price Monitor

A modern, full-stack web application built with Laravel and React for monitoring currency exchange rates and gold prices from the Polish National Bank (NBP) API. The application features real-time data visualization, personalized watchlists, and comprehensive historical data analysis.

## Features

### User Management
- **User Registration & Authentication**
- **Profile Management** - Update personal information (first name, last name, nickname)
- **Password Management** - Change password with rate limiting (6 attempts per minute)
- **Account Deletion** - Users can delete their accounts
- **Auto-generated Avatars** - Personalized avatars using the [UI Avatars API](https://ui-avatars.com/)

### Currency Monitoring
- **Personalized Watchlist** - Add and remove currencies to monitor
- **Real-time Exchange Rates** - View current exchange rates for watchlisted currencies
- **Historical Data** - Check exchange rates for any currency on any specific date
- **Interactive Charts** - Visualize exchange rate trends over time
- **NBP API Integration** - Data sourced from the official Polish National Bank API

### Gold Price Tracking
- **Gold Price History** - View gold price trends
- **Interactive Visualization** - Charts showing gold price fluctuations
- **Historical Query** - Check gold prices on specific dates

### Accessibility & Internationalization
- **Responsive Design** - Fully responsive UI optimized for mobile and desktop
- **WCAG 2.2 AA Compliant** - Meets basic accessibility guidelines
- **Multi-language Support** - Available in Polish and English with live language switching
- **Dark Mode Ready** - Using Tailwind CSS with modern design patterns

## Tech Stack

### Backend
- **PHP 8.3+** - Modern PHP features and performance
- **Laravel 12** - Latest Laravel framework with improved developer experience
- **Laravel Fortify** - Authentication scaffolding
- **Spatie Laravel Data** - Type-safe data transfer objects
- **Laravel Wayfinder** - Enhanced routing capabilities
- **MySQL**

### Frontend
- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe JavaScript
- **Inertia.js** - SPA framework for Laravel
- **Vite** - Next-generation frontend tooling
- **Tailwind CSS 4** - Utility-first CSS framework
- **React Compiler (Babel)** - Automatic React optimizations

### Development Tools
- **ESLint** - JavaScript/TypeScript linting
- **Prettier** - Code formatting
- **PHPUnit** - PHP testing framework
- **Laravel Pint** - Laravel code style fixer
- **Laravel Pail** - Real-time log viewer

## Prerequisites

- PHP >= 8.3
- Composer
- Node.js >= 22.x
- npm or yarn
- SQLite (default) or MySQL

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd rates
   ```

2. **Install PHP dependencies**
   ```bash
   composer install
   ```

3. **Install JavaScript dependencies**
   ```bash
   npm install
   ```

4. **Set up environment configuration**
   ```bash
   cp .env.example .env
   ```

5. **Generate application key**
   ```bash
   php artisan key:generate
   ```

6. **Run database migrations**
   ```bash
   php artisan migrate
   ```

7. **Sync currencies from NBP API**
   ```bash
   php artisan nbp:sync-currencies --all
   ```

8. **Cache initial exchange rates and gold prices**
   ```bash
   php artisan nbp:cache-rates
   ```


## Usage

### Development Server

1. **Start the Laravel development server**
   ```bash
   composer run dev
   ```

2. **Visit the application**
   Open `http://localhost:8000` in your browser

### Production Build

1. **Build frontend assets**
   ```bash
   npm run build
   ```

2. **Optimize Laravel**
   ```bash
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   ```

3. **Set up web server** (Nginx/Apache) to point to the `public` directory

### Using the Application

1. **Register an Account**
   - Navigate to the registration page
   - Fill in your details (first name, last name, nickname, email, password)
   - Verify your email address

2. **Set Up Your Watchlist**
   - Go to the Watchlist page
   - Add currencies you want to monitor
   - View current exchange rates for your selected currencies

3. **View Historical Data**
   - Navigate to the History page
   - Select a currency and date range
   - View interactive charts and trends

4. **Check Gold Prices**
   - Dashboard displays gold price trends for the last 10 days
   - Use the History page to query specific dates

5. **Change Language**
   - Use the language selector in the navigation
   - Switch between English and Polish

## Artisan Commands

### NBP API Commands

#### Sync Currencies
Fetches and stores available currencies from the NBP API:

```bash
# Sync from table A (most common currencies)
php artisan nbp:sync-currencies --table=A

# Sync from table B (less common currencies)
php artisan nbp:sync-currencies --table=B

# Sync from both tables
php artisan nbp:sync-currencies --all
```

#### Cache Exchange Rates
Fetches and caches current exchange rates and gold prices:

```bash
php artisan nbp:cache-rates
```

This command:
- Fetches latest exchange rates for all currencies
- Fetches latest gold prices
- Stores data in the database for fast access
- Should be run regularly (see Scheduled Tasks)


## Scheduled Tasks

The application includes a cron job configuration to automatically update currency data.

### Setting Up Cron

Add to your crontab:
```bash
* * * * * cd /path-to-your-project && php artisan schedule:run >> /dev/null 2>&1
```

Or use the included `cron.php` file:
```bash
* * * * * cd /path-to-your-project && php cron.php >> /dev/null 2>&1
```

### Scheduled Commands

The application automatically runs:
- `nbp:cache-rates` - Updates exchange rates and gold prices regularly

Configure the schedule in `app/Console/Kernel.php` or `routes/console.php`.


## API Integration

### NBP API (Polish National Bank)

The application integrates with the official NBP API:
- **Base URL**: `https://api.nbp.pl/api`
- **Documentation**: http://api.nbp.pl/

#### Endpoints Used

1. **Currency Tables**
   - `GET /exchangerates/tables/{table}` - Get currency list
   - Tables: A (common currencies), B (less common currencies)

2. **Exchange Rates**
   - `GET /exchangerates/rates/{table}/{code}/{date}` - Get rate for specific date
   - `GET /exchangerates/rates/{table}/{code}/{startDate}/{endDate}` - Get rate series

3. **Gold Prices**
   - `GET /cenyzlota/{date}` - Get gold price for specific date
   - `GET /cenyzlota/{startDate}/{endDate}` - Get gold price series

#### Rate Limiting & Caching

- API responses are cached in the database
- Automatic weekend detection (NBP doesn't publish on weekends)
- Future date validation
- Error handling with fallbacks

### UI Avatars API

User avatars are generated using:
- **Base URL**: `https://ui-avatars.com/api/`
- **Parameters**: Name, size, background color, text color
- Implemented in `AvatarService.php`

## Localization

The application supports multiple languages with real-time switching.

### Available Languages
- **English (en)** - Default
- **Polish (pl)**

## License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).