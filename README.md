# Blackjack
This repository features 2 different versions of an interactive Blackjack web app. The first is a frontend webapp that integrates the Deck of Cards API, and has basic features like sound, betting, and card dealing. The second is a fullstack version of the same webapp with its own frontend, backend, and PostgreSQL database.

**Project 1 Link:** https://blackjack-gamma-eosin.vercel.app/

**Project 2 Link:** https://blackjack-git-nodejs-wolfy411.vercel.app?_vercel_share=9M5MqvEwDNbVwSk9pbGUBewPRZ8A0fg8

It may take a moment for Project 2 to register API calls as the backend takes a bit to start after a time of inactivity.

**Check this link to see if the API is currently running:** https://blackjack-5lhc.onrender.com/api/health

<img width="3818" height="1885" alt="image" src="https://github.com/user-attachments/assets/fa01ec17-9186-40b0-a542-9814b35950e2" />

## Architecture/Stack
**Frontend:** Vue.js, Typescript, Vite, Vitest

**Backend:** Node.js, Express, TypeScript, Node:test

**Database:** PostgreSQL (Hosted on Neon)

**Hosting:** Vercel (Frontend), Render (Backend)

The webapp serves only as the messenger to the backend it stores no state, but receives JSON data from API calls and displays it for the user. The backend handles API calls and makes queries to the PostgreSQL database when a player is created, updated, or a game has ended. The database serves as the source of truth for game results and player bankrolls.

## Endpoints
**Game Endpoints**
| Type | Endpoint | Body Parameters | Result |
| ------------- | ------------- | ------------- | ------------- |
| POST | api/games/ | playerId, betAmount | Creates a new game, dealing 2 cards to the player, and 2 cards to the dealer. Obfuscates the second dealer card. Returns the game. |
| POST | api/games/:id/hit | None | Takes a game id and draws a single card for the player and returns the drawn card. If the player is over 21, the game will automatically end with the dealer winning and instead returns with the game message and game result. Returns a 409 error if the game has already ended. |
| POST | api/games/:id/stand | None | Takes a game id and ends the player's turn, dealer draws cards until their card total reaches 17 or they beat the player. This returns a game message, the game id, and the game result. Returns a 409 error if the game has already ended. |
| GET | api/games/:id | None | Returns the current playstate of the game, showing player card total, dealer card total, player hand, and dealer hand. If the game has not ended the dealer hand will be obfuscated. |

**Player Endpoints**
| Type | Endpoint | Body Parameters | Result |
| ------------- | ------------- | ------------- | ------------- |
| POST | api/players/ | None | Creates a new player and returns it. |
| POST | api/players/:id/reload | OPTIONAL: forcedBankroll | Takes a player id and refreshes their bankroll to 1000 if it is equal to 0, otherwise it returns a 409 error. If forced bankroll is used, it will be treated as the player's bankroll instead of their actual bankroll. |
| GET | api/players/:id | None | Takes a player id and returns their current bankroll. |

**Generic Endpoints**
| Type | Endpoint | Body Parameters | Result |
| ------------- | ------------- | ------------- | ------------- |
| GET | api/health | None | Returns a value whether or not the backend is running. |

## Database Tables
**players**
  - `id`: A random uuid primary key that is created when first added to the table.
  - `bankroll`: An integer that is defaulted to 1000 when a player is first created, and is updated when a game ends.
  - `created_at`: A timestamp that displays the current time when it is first added to the table.

**games**
  - `id`: A random uuid primary key that is created when first added to the table.
  - `player_id`: A uuid reference to the id of the player that played that game.
  - `bet`: An integer that displays how much the player bet at the beginning of the game.
  - `outcome`: The text outcome of the game, can only return (player, dealer, push)
  - `payout`: An integer that displays how much money would be awarded to the player on a win.
  - `bankroll_after`: An integer that displays the new updated bankroll of the player at the end of the game.
  - `player_total`: An integer that displays the card total of the player at the end of the game.
  - `dealer_total`: An integer that displays the card total of the dealer at the end of the game.
  - `settled_at`: A timestamp that displays the current time when it is first added to the table.

## Setup
**To run the fullstack app locally you'll need to make sure you clone or download the nodejs branch of this repository. You also need to make sure you have pgAdmin 4 installed.**
1. Open a terminal in both the server and frontend folders and run `npm install` to install dependencies.
2. Set up environment variables for the backend in a .env file inside the server folder:
    - `DB_USER` = database username
    - `DB_HOST` = database hostname
    - `DB_NAME` = database name
    - `DB_PASSWORD` = database password
    - `DB_PORT` = database port
    - `PORT` = what port you want the backend to run on (3000)
3. Run `npm run migrate` to generate the SQL tables. You should see them on pgAdmin 4 if the setup is correct.
4. Set up environment variables for the frontend in a .env file inside the frontend folder:
    - `VITE_API_URL` = the url for your backend (e.g., http://0.0.0.0:3000/api)
5. Run `npm run dev` in both the frontend and backend folders.
6. Open the website displayed in the frontend console and everything should be working.

To run tests, run `npm run test` in either the frontend or backend folder.

## Tests
**Frontend**
  - Deck Score Check: Checks if face cards, aces, and value cards are added correctly using the frontend card total function.
  - Bet Check: Ensures the player cannot withdraw or place bets with money they don't have.
  - Bet Controls: Makes sure that all buttons are disabled when a round is active.

**Backend**
These tests use a fixed deck to ensure that the results are consistent and certain outcomes can be tested. In addition the deck is reset and all active games, ended games, and players are cleared after each test.
  - Game Start Check: Makes sure both the dealer and the player have 2 cards, and the last dealer card is obfuscated.
  - Hit Check: Makes sure the player draws a card.
  - Stand Check: Makes sure that stand ends the game.
  - Hit After Game End Check: Makes sure a hit request always returns 409 when the game ends.
  - Invalid Id For Hit, Stand, and Get check: Invalid id will always return 404 when making a hit, stand, or get request.
  - Bet Check: A bet greater than the player's bankroll will always fail.
  - Win Bankroll Check: When the player wins, their bankroll should now equal the sum of their bankroll plus double their current bet.
  - Reload Check: Player cannot gain 1000 bankroll using reload unless their bankroll equals exactly 0.
  - DB Game Check: Ensures that the database game end value is equal to the game end return value from the API.
  - DB Player Check: Ensures that the database player is equal to the player return value from the API.
  - DB Bankroll Check: Makes sure that the bankroll for the player in the database is equal to the bankroll return value from the API after winning a game.

## Design Choices
  - Active games and decks are only stored in the backend's memory rather than the database. Games are only saved to the database when they are finished. This prevents database bloat from abandoned games and removes the need to constantly update the database every time a single card is drawn.
  - The frontend no longer has any data validation, it is purely visual. Game state management is purely handled by the backend and prevents users from manipulating the game state.

## Lessons Learned
  - Before creating this project I had no clue how to build with Vue, or even setup a backend. After this project I am now confident in my abilities to not only create more backends but also refactor other projects into using their own APIs. 
  - I learned the importance of separation of logic. Before refactoring the frontend, I had no way to test API calls or logic calls without triggering multiple functions at once. After the refactor, I could easily test API calls and game logic independently.
  - Another thing I ended up learning how to do is use the same repo for both frontend and backend, and hosting them on a variety of different services. I also learned how to make my own GitHub workflows, which allowed me to automatically run tests on the backend and frontend after deployment and type check to ensure everything was working as intended.
