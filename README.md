# XO ARENA – An Interactive Tic-Tac-Toe Gaming Platform with AI-Based Opponent

XO ARENA is an interactive, web-based Tic-Tac-Toe game developed using **React** and **JavaScript**. It combines the traditional 3 × 3 Tic-Tac-Toe game with an AI-based opponent, multiple game modes, and player-tracking features.

The project demonstrates practical applications of **arrays, conditional logic, loops, recursion, game-state evaluation, and the Minimax algorithm**.

## Features

- **Player vs Bot:** Play against an AI-controlled opponent.
- **Player vs Player:** Play locally with another person on the same device.
- **Three AI difficulty levels:**
  - **Easy:** Selects a random available cell.
  - **Medium:** Prioritizes winning moves, blocks immediate opponent wins, and considers strategic positions.
  - **Hard:** Uses the **Minimax algorithm** to evaluate possible future game states and choose an optimal move.
- **Game outcome detection:** Detects wins and draws using the eight possible winning combinations.
- **Leaderboard:** Displays player rankings based on recorded results.
- **Player statistics:** Tracks games, wins, losses, draws, and winning streaks.
- **Match history:** Keeps records of completed matches.
- **Game controls:** Includes undo, restart, and rematch options.
- **Theme customization:** Supports dark and light themes.
- **Sound effects:** Provides audio feedback for game events.
- **Rules section:** Explains how to play.
- **Local persistence:** Uses browser Local Storage for game settings, leaderboard records, player statistics, and match history.

## Screenshots and Flowchart

The images below are included from the project's mini-project report. They are provided as separate files in the `assets/` directory.

### Application flowchart

<img width="975" height="870" alt="image" src="https://github.com/user-attachments/assets/ee41e384-4158-479e-a782-375aacc2cbdb" />


### Home page

<img width="975" height="219" alt="image" src="https://github.com/user-attachments/assets/a97261c2-2dbc-4237-8fc5-909f34e06ae1" />

### Game mode selection

<img width="975" height="271" alt="image" src="https://github.com/user-attachments/assets/a347f7ac-3611-4866-80cf-ef1ae95f79ba" />


### Difficulty selection

<img width="975" height="536" alt="image" src="https://github.com/user-attachments/assets/99f75188-94d9-4ba1-a05f-2c18ea8961a9" />


### Game board




### AI gameplay

<img width="969" height="259" alt="image" src="https://github.com/user-attachments/assets/883fc815-d71f-4399-b94b-b71b44eb0d36" />


### Winning condition

<img width="975" height="654" alt="image" src="https://github.com/user-attachments/assets/cada8de2-20b1-462e-b5b2-df50da2317b9" />


### Leaderboard

<img width="975" height="593" alt="image" src="https://github.com/user-attachments/assets/b3af8edd-0e0e-40d9-8199-0a3413dc0d92" />


### Player statistics and match history

<img width="961" height="411" alt="image" src="https://github.com/user-attachments/assets/a747397a-4e85-4f53-9fca-ae1e3d44fad2" />


## Technology Stack

| Technology | Purpose |
|---|---|
| JavaScript | Game logic, AI decision-making, and application functionality |
| React.js | Interactive user interface and component-based development |
| Vite | Development server and build tool |
| HTML5 | Web application structure |
| CSS3 | Layout, styling, animations, and themes |
| Tailwind CSS | Utility-based styling configuration |
| Lucide React | Interface icons |
| Browser Local Storage | Persistent storage of settings and game records |
| Node.js | Running the automated test suite |
| Visual Studio Code | Development environment |

## Data Structures and Algorithms

### Game board representation

The 3 × 3 board is represented using a one-dimensional array of nine elements. Each element corresponds to one cell:

```js
[null, null, null, null, null, null, null, null, null]
```

- `X` represents Player X.
- `O` represents Player O.
- `null` represents an empty cell.

### Winning-condition detection

The game checks eight predefined winning combinations:

- Three horizontal lines
- Three vertical lines
- Two diagonal lines

### Minimax algorithm

The Hard AI uses Minimax, a recursive decision-making algorithm for two-player games. It explores possible future moves, evaluates terminal game states, and chooses the move with the best score assuming the opponent also plays optimally.

The project's scoring approach is:

- AI win: positive score
- Opponent win: negative score
- Draw: zero score

The algorithm also considers game-tree depth to prefer faster wins and delay losses.

## Project Structure

The main files documented for the project are:

```text
XO-ARENA/
├── src/
│   ├── App.jsx
│   ├── game.js
│   ├── game.test.js
│   ├── main.jsx
│   └── styles.css
├── assets/
│   ├── flowchart.png
│   ├── home-page.png
│   ├── game-mode-selection.png
│   ├── difficulty-selection.png
│   ├── game-board.png
│   ├── ai-gameplay.png
│   ├── winning-condition.png
│   ├── leaderboard.png
│   └── player-statistics-and-match-history.png
├── index.html
├── package.json
├── package-lock.json
└── vite.config.js
```

> The exact location of source files may differ depending on the project's current folder structure. The `assets/` directory contains the report images included with this README.

## Getting Started

### Prerequisites

Install **Node.js** and **npm** before running the project.

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/YOUR_USERNAME/XO-ARENA.git
   ```

2. Move into the project directory:

   ```bash
   cd XO-ARENA
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open the local URL printed in the terminal (Vite commonly uses `http://localhost:5173`).

### Build for production

```bash
npm run build
```

### Run tests

The project report documents a Node.js built-in test suite in `game.test.js`. If the test script is configured in `package.json`, run:

```bash
npm test
```

If no `test` script is defined, check `package.json` for the exact test command before running it.

## Testing

The project report records successful results for these test scenarios:

| Test case | Expected behaviour | Reported result |
|---|---|---|
| Winning condition | Detects Player X's winning line | Passed |
| Draw condition | Detects a full board with no winner | Passed |
| Easy bot | Selects an available cell | Passed |
| Medium bot winning move | Completes an immediate winning combination | Passed |
| Medium bot blocking move | Blocks the opponent's immediate win | Passed |
| Hard bot winning move | Selects an immediate winning move | Passed |
| Hard bot decision-making | Does not lose when responding to legal optimal play | Passed |

## Future Enhancements

Potential future improvements identified in the project report include:

- Online multiplayer using real-time communication.
- User authentication and personalized profiles.
- Global leaderboard and online rankings.
- Multiplayer tournaments and competitions.
- Additional game modes and challenges.
- Advanced AI strategies and difficulty levels.
- Cloud-based storage for player statistics.
- Android and iOS application support.
- Daily challenges and achievement badges.
- Improved accessibility and interface customization.

## References

- [React Documentation](https://react.dev/)
- [JavaScript – MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [Vite Documentation](https://vite.dev/)
- [Node.js Documentation](https://nodejs.org/docs/)
- [Minimax Algorithm](https://en.wikipedia.org/wiki/Minimax)
- [Lucide React Documentation](https://lucide.dev/guide/packages/lucide-react)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Author

**Developed as a Data Structure and Algorithm mini project**  
School of Technology and Research  
Dnyaan Prasad Global University  
Academic Year: 2026–2027 (Sem-I)

---

If you find this project useful, feel free to star the repository.
