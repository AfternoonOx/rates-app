# Monitor Kursów Walut i Cen Złota

Nowoczesna aplikacja webowa stworzona w Laravel i React, która pozwala śledzić kursy walut oraz ceny złota pobierane bezpośrednio z API Narodowego Banku Polskiego. Aplikacja oferuje interaktywne wykresy, osobistą listę obserwowanych walut i możliwość przeglądania danych historycznych.

## Co oferuje aplikacja?

### Konta użytkowników
- Rejestracja i logowanie z weryfikacją e-mail
- Zarządzanie profilem – możliwość zmiany imienia, nazwiska i pseudonimu
- Zmiana hasła z ograniczeniem do 6 prób na minutę
- Usuwanie konta
- Automatycznie generowane awatary dzięki [UI Avatars API](https://ui-avatars.com/)

### Śledzenie kursów walut
- Lista obserwowanych – dodawaj i usuwaj waluty według własnych potrzeb
- Aktualne kursy wymiany dla wybranych walut
- Dane historyczne – sprawdź kurs dowolnej waluty na wybraną datę
- Interaktywne wykresy pokazujące trendy kursowe
- Dane pobierane bezpośrednio z oficjalnego API NBP

### Ceny złota
- Historia cen złota wyświetlana na wykresach
- Możliwość sprawdzenia ceny złota w konkretnym dniu

### Dostępność i wygoda
- W pełni responsywny interfejs – działa świetnie na telefonach i komputerach
- Zgodność z wytycznymi dostępności WCAG 2.2 AA
- Obsługa języka polskiego i angielskiego z możliwością przełączania w locie

## Użyte technologie

### Backend
- **PHP 8.3+**
- **Laravel 12**
- **Laravel Fortify** – obsługa autoryzacji
- **Spatie Laravel Data** – typowane obiekty transferu danych
- **Laravel Wayfinder** – rozszerzone możliwości routingu
- **MySQL**

### Frontend
- **React 19**
- **TypeScript**
- **Inertia.js** – framework SPA dla Laravela
- **Vite** – nowoczesne narzędzie budowania frontendu
- **Tailwind CSS 4**
- **React Compiler (Babel)** – automatyczne optymalizacje React

### Narzędzia deweloperskie
- **ESLint** – linter JavaScript/TypeScript
- **Prettier** – formatowanie kodu
- **PHPUnit** – testy PHP
- **Laravel Pint** – formatowanie kodu PHP
- **Laravel Pail** – podgląd logów w czasie rzeczywistym

## Wymagania

- PHP >= 8.3
- Composer
- Node.js >= 22.x
- npm lub yarn
- SQLite (domyślnie) lub MySQL

## Instalacja

1. **Sklonuj repozytorium**
   ```bash
   git clone <adres-repozytorium>
   cd rates
   ```

2. **Zainstaluj zależności PHP**
   ```bash
   composer install
   ```

3. **Zainstaluj zależności JavaScript**
   ```bash
   npm install
   ```

4. **Skonfiguruj środowisko**
   ```bash
   cp .env.example .env
   ```

5. **Wygeneruj klucz aplikacji**
   ```bash
   php artisan key:generate
   ```

6. **Uruchom migracje bazy danych**
   ```bash
   php artisan migrate
   ```

7. **Pobierz listę walut z API NBP**
   ```bash
   php artisan nbp:sync-currencies --all
   ```

8. **Zapisz aktualne kursy i ceny złota w cache**
   ```bash
   php artisan nbp:cache-rates
   ```

## Uruchomienie

### Tryb deweloperski

1. **Uruchom serwer**
   ```bash
   composer run dev
   ```

2. **Otwórz aplikację**
   Wejdź na `http://localhost:8000` w przeglądarce

### Wersja produkcyjna

1. **Zbuduj assety frontendowe**
   ```bash
   npm run build
   ```

2. **Zoptymalizuj Laravel**
   ```bash
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   ```

3. **Skonfiguruj serwer WWW** (Nginx/Apache), aby wskazywał na katalog `public`

### Jak korzystać z aplikacji?

1. **Załóż konto**
   - Przejdź do strony rejestracji
   - Wypełnij formularz (imię, nazwisko, pseudonim, e-mail, hasło)

2. **Stwórz swoją listę obserwowanych**
   - Przejdź do zakładki Lista obserwowanych
   - Dodaj waluty, które chcesz śledzić
   - Sprawdzaj aktualne kursy wybranych walut

3. **Przeglądaj dane historyczne**
   - Przejdź do zakładki Historia
   - Wybierz walutę i zakres dat
   - Analizuj trendy na interaktywnych wykresach

4. **Sprawdzaj ceny złota**
   - Na dashboardzie widoczny jest wykres cen złota z ostatnich 10 dni
   - W zakładce Historia możesz sprawdzić cenę na konkretny dzień

5. **Zmień język**
   - Użyj przełącznika języka w nawigacji
   - Możesz wybrać polski lub angielski

## Komendy Artisan

### Synchronizacja z API NBP

#### Pobieranie listy walut
Pobiera i zapisuje dostępne waluty z API NBP:

```bash
# Pobierz waluty z tabeli A (najczęściej używane)
php artisan nbp:sync-currencies --table=A

# Pobierz waluty z tabeli B (rzadziej używane)
php artisan nbp:sync-currencies --table=B

# Pobierz waluty z obu tabel
php artisan nbp:sync-currencies --all
```

#### Aktualizacja kursów
Pobiera i zapisuje aktualne kursy walut oraz ceny złota:

```bash
php artisan nbp:cache-rates
```

Ta komenda:
- Pobiera najnowsze kursy wszystkich walut
- Pobiera aktualną cenę złota
- Zapisuje dane w bazie dla szybkiego dostępu
- Powinna być uruchamiana regularnie (patrz: Zaplanowane zadania)

## Zaplanowane zadania

Aplikacja zawiera konfigurację cron do automatycznej aktualizacji danych.

### Konfiguracja crona

Dodaj do crontab:
```bash
* * * * * cd /ścieżka-do-projektu && php artisan schedule:run >> /dev/null 2>&1
```

Lub użyj załączonego pliku `cron.php`:
```bash
* * * * * cd /ścieżka-do-projektu && php cron.php >> /dev/null 2>&1
```

### Automatycznie uruchamiane komendy

Aplikacja automatycznie wykonuje:
- `nbp:cache-rates` – regularna aktualizacja kursów walut i cen złota

Harmonogram można skonfigurować w `app/Console/Kernel.php` lub `routes/console.php`.

## Integracja z API

### API NBP (Narodowy Bank Polski)

Aplikacja korzysta z oficjalnego API NBP:
- **Adres bazowy**: `https://api.nbp.pl/api`
- **Dokumentacja**: http://api.nbp.pl/

#### Wykorzystywane endpointy

1. **Tabele walut**
   - `GET /exchangerates/tables/{table}` – lista walut
   - Tabele: A (popularne waluty), B (mniej popularne)

2. **Kursy wymiany**
   - `GET /exchangerates/rates/{table}/{code}/{date}` – kurs na konkretną datę
   - `GET /exchangerates/rates/{table}/{code}/{startDate}/{endDate}` – seria kursów

3. **Ceny złota**
   - `GET /cenyzlota/{date}` – cena złota na konkretną datę
   - `GET /cenyzlota/{startDate}/{endDate}` – seria cen

### API UI Avatars

Awatary użytkowników są generowane za pomocą:
- **Adres bazowy**: `https://ui-avatars.com/api/`
- **Parametry**: imię, rozmiar, kolor tła, kolor tekstu
- Zaimplementowane w `AvatarService.php`

## Obsługiwane języki

Aplikacja obsługuje przełączanie języka w czasie rzeczywistym:
- **Angielski (en)** – domyślny
- **Polski (pl)**

## Licencja

Ten projekt jest oprogramowaniem open source na licencji [MIT](https://opensource.org/licenses/MIT).
