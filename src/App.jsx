import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft, ArrowRight, Award, BarChart3, Bot, ChevronDown, CircleHelp,
  Crown, Flame, Gamepad2, History, Home, Moon, RotateCcw, Search,
  Settings2, Shield, Sparkles, Sun, Trophy, Undo2, Volume2, VolumeX, X,
} from 'lucide-react';
import { chooseBotMove, getOutcome } from './game.js';

const STORAGE = {
  settings: 'xo-arena-settings',
  leaderboard: 'xo-arena-leaderboard',
  stats: 'xo-arena-stats',
  history: 'xo-arena-history',
};

const defaultSettings = {
  mode: 'bot',
  difficulty: 'medium',
  humanMark: 'X',
  playerX: '',
  playerO: '',
  sound: true,
  theme: 'dark',
};

const defaultStats = {
  totalGames: 0,
  xWins: 0,
  oWins: 0,
  botWins: 0,
  draws: 0,
  currentStreak: 0,
  bestStreak: 0,
  streakName: '',
};

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    if (!value) return fallback;
    const parsed = JSON.parse(value);
    if (Array.isArray(fallback)) return Array.isArray(parsed) ? parsed : fallback;
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? { ...fallback, ...parsed }
      : fallback;
  } catch {
    return fallback;
  }
}

function readSettings() {
  const settings = readStorage(STORAGE.settings, defaultSettings);
  if (settings.playerX === 'Alex' && settings.playerO === 'Sam') {
    return { ...settings, playerX: '', playerO: '' };
  }
  return settings;
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Unable to save ${key} to local storage.`, error);
  }
}

function cleanName(value, fallback) {
  return value.trim().slice(0, 20) || fallback;
}

function playerRecord(records, name) {
  return records.find((record) => record.name.toLowerCase() === name.toLowerCase());
}

function updatePlayer(records, name, result) {
  const existing = playerRecord(records, name);
  if (existing) {
    return records.map((record) => record === existing
      ? { ...record, matches: record.matches + 1, wins: record.wins + (result === 'win' ? 1 : 0), losses: record.losses + (result === 'loss' ? 1 : 0), draws: record.draws + (result === 'draw' ? 1 : 0) }
      : record);
  }
  return [...records, {
    name,
    matches: 1,
    wins: result === 'win' ? 1 : 0,
    losses: result === 'loss' ? 1 : 0,
    draws: result === 'draw' ? 1 : 0,
  }];
}

function App() {
  const [settings, setSettings] = useState(readSettings);
  const [leaderboard, setLeaderboard] = useState(() => readStorage(STORAGE.leaderboard, []));
  const [stats, setStats] = useState(() => readStorage(STORAGE.stats, defaultStats));
  const [matches, setMatches] = useState(() => readStorage(STORAGE.history, []));
  const [page, setPage] = useState('home');
  const [board, setBoard] = useState(Array(9).fill(null));
  const [moves, setMoves] = useState([]);
  const [currentTurn, setCurrentTurn] = useState('X');
  const [outcome, setOutcome] = useState(null);
  const [thinking, setThinking] = useState(false);
  const [rematches, setRematches] = useState(0);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('wins');
  const [showRules, setShowRules] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => writeStorage(STORAGE.settings, settings), [settings]);
  useEffect(() => writeStorage(STORAGE.leaderboard, leaderboard), [leaderboard]);
  useEffect(() => writeStorage(STORAGE.stats, stats), [stats]);
  useEffect(() => writeStorage(STORAGE.history, matches), [matches]);

  const humanMark = settings.humanMark;
  const botMark = humanMark === 'X' ? 'O' : 'X';
  const botTurn = settings.mode === 'bot' && currentTurn === botMark && !outcome && page === 'game';
  const canUndo = moves.length > (settings.mode === 'bot' && moves[0]?.mark === botMark ? 1 : 0);

  const announce = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2400);
  };

  const startGame = (isRematch = false) => {
    setBoard(Array(9).fill(null));
    setMoves([]);
    setCurrentTurn('X');
    setOutcome(null);
    setThinking(false);
    if (isRematch) setRematches((count) => count + 1);
    else setRematches(0);
    setPage('game');
  };

  const completeMatch = useCallback((finalOutcome) => {
    const xName = settings.mode === 'bot'
      ? (settings.humanMark === 'X' ? cleanName(settings.playerX, 'You') : 'XO Arena Bot')
      : cleanName(settings.playerX, 'Player X');
    const oName = settings.mode === 'bot'
      ? (settings.humanMark === 'O' ? cleanName(settings.playerO, 'You') : 'XO Arena Bot')
      : cleanName(settings.playerO, 'Player O');
    const result = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      date: new Date().toISOString(),
      mode: settings.mode,
      difficulty: settings.difficulty,
      xName,
      oName,
      winner: finalOutcome.winner,
      result: finalOutcome.result,
      moves: moves.length + 1,
    };
    const winnerName = finalOutcome.winner === 'X' ? xName : oName;
    setMatches((previous) => [result, ...previous].slice(0, 100));
    if (settings.mode === 'bot') {
      const humanName = settings.humanMark === 'X' ? xName : oName;
      const humanResult = finalOutcome.result === 'draw' ? 'draw' : finalOutcome.winner === settings.humanMark ? 'win' : 'loss';
      const botResult = finalOutcome.result === 'draw' ? 'draw' : humanResult === 'win' ? 'loss' : 'win';
      setLeaderboard((previous) => updatePlayer(updatePlayer(previous, humanName, humanResult), 'XO Arena Bot', botResult));
    } else {
      const xResult = finalOutcome.result === 'draw' ? 'draw' : finalOutcome.winner === 'X' ? 'win' : 'loss';
      const oResult = finalOutcome.result === 'draw' ? 'draw' : xResult === 'win' ? 'loss' : 'win';
      setLeaderboard((previous) => updatePlayer(updatePlayer(previous, xName, xResult), oName, oResult));
    }
    setStats((previous) => {
      const won = finalOutcome.result === 'win';
      const streak = won
        ? previous.streakName === winnerName ? previous.currentStreak + 1 : 1
        : 0;
      return {
        ...previous,
        totalGames: previous.totalGames + 1,
        xWins: previous.xWins + (finalOutcome.winner === 'X' ? 1 : 0),
        oWins: previous.oWins + (finalOutcome.winner === 'O' ? 1 : 0),
        botWins: previous.botWins + (settings.mode === 'bot' && finalOutcome.winner === botMark ? 1 : 0),
        draws: previous.draws + (finalOutcome.result === 'draw' ? 1 : 0),
        currentStreak: streak,
        bestStreak: Math.max(previous.bestStreak, streak),
        streakName: won ? winnerName : '',
      };
    });
  }, [botMark, moves.length, settings]);

  const placeMove = useCallback((index) => {
    if (board[index] || outcome || (settings.mode === 'bot' && currentTurn !== humanMark && !thinking)) return;
    const nextBoard = [...board];
    nextBoard[index] = currentTurn;
    const nextMoves = [...moves, { index, mark: currentTurn }];
    const nextOutcome = getOutcome(nextBoard);
    setBoard(nextBoard);
    setMoves(nextMoves);
    setThinking(false);
    if (nextOutcome) {
      setOutcome(nextOutcome);
      completeMatch(nextOutcome);
    } else {
      setCurrentTurn(currentTurn === 'X' ? 'O' : 'X');
    }
    if (settings.sound) playSound(nextOutcome?.result || 'move');
  }, [board, completeMatch, currentTurn, humanMark, moves, outcome, settings.mode, settings.sound, thinking]);

  useEffect(() => {
    if (!botTurn) return undefined;
    setThinking(true);
    const timer = window.setTimeout(() => {
      const move = chooseBotMove(board, botMark, settings.difficulty);
      if (move !== null) placeMove(move);
      else setThinking(false);
    }, 720);
    return () => window.clearTimeout(timer);
  }, [board, botMark, botTurn, placeMove, settings.difficulty]);

  const undoMove = () => {
    if (!canUndo || outcome) return;
    const removeCount = settings.mode === 'bot' && moves[moves.length - 1].mark === botMark ? 2 : 1;
    const nextMoves = moves.slice(0, Math.max(0, moves.length - removeCount));
    const nextBoard = Array(9).fill(null);
    nextMoves.forEach(({ index, mark }) => { nextBoard[index] = mark; });
    setMoves(nextMoves);
    setBoard(nextBoard);
    setCurrentTurn(nextMoves.length ? (nextMoves[nextMoves.length - 1].mark === 'X' ? 'O' : 'X') : 'X');
    setThinking(false);
  };

  useEffect(() => {
    const handleUndoShortcut = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        undoMove();
      }
    };
    window.addEventListener('keydown', handleUndoShortcut);
    return () => window.removeEventListener('keydown', handleUndoShortcut);
  });

  const newGame = () => {
    if (moves.length && !outcome && !window.confirm('Start a new match? The current game will not be added to your stats.')) return;
    startGame(false);
  };

  const restartGame = () => {
    if (moves.length && !outcome && !window.confirm('Restart this match? The current game will not be added to your stats.')) return;
    setBoard(Array(9).fill(null));
    setMoves([]);
    setCurrentTurn('X');
    setOutcome(null);
    setThinking(false);
  };

  const resetStatistics = () => {
    if (!window.confirm('Reset all stats, leaderboard entries and match history? This cannot be undone.')) return;
    setStats(defaultStats);
    setLeaderboard([]);
    setMatches([]);
    announce('Your arena records have been reset.');
  };

  const resetLeaderboard = () => {
    if (!window.confirm('Reset the leaderboard? Player match history and session statistics will be kept.')) return;
    setLeaderboard([]);
    announce('The leaderboard has been reset.');
  };

  const beginMatch = () => {
    const names = settings.mode === 'bot'
      ? [settings.humanMark === 'X' ? settings.playerX : settings.playerO]
      : [settings.playerX, settings.playerO];
    if (names.some((name) => !cleanName(name, ''))) {
      announce(settings.mode === 'bot' ? 'Enter your name before starting.' : 'Enter a name for both players before starting.');
      return;
    }
    startGame(false);
  };

  const sortedPlayers = useMemo(() => {
    const filtered = leaderboard.filter((player) => player.name.toLowerCase().includes(search.trim().toLowerCase()));
    return [...filtered].sort((a, b) => {
      if (sortBy === 'winRate') return (b.wins / Math.max(b.matches, 1)) - (a.wins / Math.max(a.matches, 1)) || b.wins - a.wins;
      if (sortBy === 'matches') return b.matches - a.matches || b.wins - a.wins;
      return b.wins - a.wins || (b.wins / Math.max(b.matches, 1)) - (a.wins / Math.max(a.matches, 1)) || b.matches - a.matches;
    }).slice(0, 10);
  }, [leaderboard, search, sortBy]);

  const activeName = settings.mode === 'bot'
    ? currentTurn === humanMark ? 'Your turn' : 'Arena Bot'
    : currentTurn === 'X' ? cleanName(settings.playerX, 'Player X') : cleanName(settings.playerO, 'Player O');

  return (
    <div className={`app-shell theme-${settings.theme}`}>
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <header className="topbar">
        <button className="brand" onClick={() => setPage('home')} aria-label="XO Arena home">
          <span className="brand-mark"><span>X</span><span>O</span></span>
          <span>XO <b>ARENA</b></span>
        </button>
        <nav className="main-nav" aria-label="Main navigation">
          {[
            { id: 'home', label: 'Home', icon: Home },
            { id: 'game', label: 'Play', icon: Gamepad2 },
            { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
            { id: 'stats', label: 'Stats', icon: BarChart3 },
          ].map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => id === 'game' && page !== 'game' ? setPage('setup') : setPage(id)} className={`nav-link ${page === id || (id === 'game' && page === 'setup') ? 'active' : ''}`}>
              <Icon size={16} /><span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="top-actions">
          <button className="icon-button" title={settings.sound ? 'Turn sound off' : 'Turn sound on'} onClick={() => setSettings((value) => ({ ...value, sound: !value.sound }))}>
            {settings.sound ? <Volume2 size={17} /> : <VolumeX size={17} />}
          </button>
          <button className="icon-button theme-toggle" title="Toggle theme" onClick={() => setSettings((value) => ({ ...value, theme: value.theme === 'dark' ? 'light' : 'dark' }))}>
            {settings.theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <button className="avatar" title="Your player statistics" onClick={() => setPage('stats')}><BarChart3 size={16} /></button>
        </div>
      </header>

      <main className="page-content">
        {page === 'home' && (
          <HomePage stats={stats} matches={matches} onPlay={() => setPage('setup')} onLeaderboard={() => setPage('leaderboard')} onRules={() => setShowRules(true)} />
        )}
        {page === 'setup' && (
          <SetupPage settings={settings} setSettings={setSettings} onBack={() => setPage('home')} onStart={beginMatch} />
        )}
        {page === 'game' && (
          <section className="game-layout">
            {outcome?.result === 'win' && <Confetti />}
            <div className="game-heading">
              <button className="back-link" onClick={() => setPage('home')}><ArrowLeft size={16} /> Back to home</button>
              <div className="heading-tools">
                <span className="mode-pill"><span className="live-dot" />{settings.mode === 'bot' ? `${settings.difficulty} bot` : 'local multiplayer'}</span>
                {rematches > 0 && <span className="rematch-pill"><RotateCcw size={13} /> Rematch #{rematches}</span>}
              </div>
            </div>
            <div className="play-columns">
              <div className="board-panel glass-card">
                <div className="game-status">
                  <div className="status-copy">
                    <span className={`turn-symbol ${currentTurn === 'X' ? 'symbol-x' : 'symbol-o'}`}>{outcome ? outcome.winner || '—' : currentTurn}</span>
                    <div><p className="eyebrow">{outcome ? 'MATCH COMPLETE' : thinking ? 'BOT IS THINKING' : 'UP NEXT'}</p><h2>{outcome ? outcome.result === 'draw' ? 'It’s a draw!' : `${outcome.winner === 'X' ? cleanName(settings.mode === 'bot' && humanMark !== 'X' ? 'XO Arena Bot' : settings.playerX, 'Player X') : cleanName(settings.mode === 'bot' && humanMark !== 'O' ? 'XO Arena Bot' : settings.playerO, 'Player O')} wins!` : thinking ? 'Choosing a move…' : activeName}</h2></div>
                  </div>
                  <span className={`turn-tag ${!outcome && currentTurn === 'X' ? 'x-tag' : !outcome ? 'o-tag' : ''}`}>{outcome ? 'FINAL' : `${currentTurn} TURN`}</span>
                </div>
                <div className="board-wrap">
                  {thinking && <div className="thinking-note"><span className="thinking-dots"><i /><i /><i /></span> The bot is thinking</div>}
                  <div className={`game-board ${thinking ? 'board-thinking' : ''}`} role="grid" aria-label="Tic-tac-toe game board">
                    {board.map((cell, index) => (
                      <button key={index} role="gridcell" aria-label={`Cell ${index + 1}${cell ? `, ${cell}` : ', empty'}`} className={`board-cell ${cell === 'X' ? 'cell-x' : cell === 'O' ? 'cell-o' : ''} ${outcome?.line.includes(index) ? 'winning-cell' : ''}`} onClick={() => placeMove(index)} disabled={Boolean(cell) || Boolean(outcome) || thinking || (settings.mode === 'bot' && currentTurn !== humanMark)}>
                        {cell && <span className="placed-mark">{cell}</span>}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="board-footer">
                  <span><span className="turn-indicator" />{outcome ? 'Ready for another round?' : 'Make your move'}</span>
                  <span>{moves.length} / 9 moves</span>
                </div>
                {outcome && (
                  <div className="result-actions">
                    <div className="result-callout"><span className="result-sparkle"><Sparkles size={16} /></span><span>{outcome.result === 'draw' ? 'Well played. The next one is yours.' : outcome.winner === humanMark || settings.mode === 'multiplayer' ? 'Great game! Ready for another?' : 'Every champion learns from a challenge.'}</span></div>
                    <button className="button button-primary full-button" onClick={() => startGame(true)}><RotateCcw size={16} /> Play again <ArrowRight size={16} /></button>
                    <button className="text-button" onClick={() => setPage('setup')}><Settings2 size={15} /> Change settings</button>
                  </div>
                )}
              </div>
              <aside className="game-sidebar">
                <div className="glass-card score-card">
                  <div className="card-title-row"><div><p className="eyebrow">THIS SESSION</p><h3>Scoreboard</h3></div><span className="session-icon"><BarChart3 size={17} /></span></div>
                  <div className="score-row"><span className="score-mark symbol-x">X</span><span className="score-player">{settings.mode === 'bot' ? humanMark === 'X' ? 'You' : 'Arena Bot' : cleanName(settings.playerX, 'Player X')}</span><strong>{stats.xWins}</strong></div>
                  <div className="score-row"><span className="score-mark symbol-o">O</span><span className="score-player">{settings.mode === 'bot' ? humanMark === 'O' ? 'You' : 'Arena Bot' : cleanName(settings.playerO, 'Player O')}</span><strong>{stats.oWins}</strong></div>
                  <div className="score-divider" />
                  <div className="mini-stat-line"><span>Bot victories</span><b>{stats.botWins}</b></div>
                  <div className="mini-stat-line"><span>Draws</span><b>{stats.draws}</b></div>
                  <div className="mini-stat-line"><span>Games played</span><b>{stats.totalGames}</b></div>
                </div>
                <div className="glass-card controls-card">
                  <p className="eyebrow">GAME CONTROLS</p>
                  <button className="control-button" onClick={newGame}><Gamepad2 size={16} /><span>New game</span><ChevronDown size={14} className="control-arrow" /></button>
                  <button className="control-button" onClick={restartGame}><RotateCcw size={16} /><span>Restart game</span><ChevronDown size={14} className="control-arrow" /></button>
                  <button className="control-button" onClick={undoMove} disabled={!canUndo || Boolean(outcome)}><Undo2 size={16} /><span>Undo move</span><span className="control-hint">⌘ Z</span></button>
                  <button className="control-button" onClick={() => setPage('setup')}><Settings2 size={16} /><span>Change game mode</span><ChevronDown size={14} className="control-arrow" /></button>
                </div>
                <button className="tip-card" onClick={() => setShowRules(true)}><span className="tip-icon"><Sparkles size={17} /></span><span><b>Quick tip</b><small>Own the center to control the board.</small></span><ArrowRight size={15} /></button>
              </aside>
            </div>
          </section>
        )}
        {page === 'leaderboard' && (
          <section className="subpage">
            <div className="leader-heading-row"><PageHeading eyebrow="THE ARENA’S FINEST" title="Leaderboard" description="Every match counts. Every win earns its place." icon={Trophy} />{leaderboard.length > 0 && <button className="text-button reset-board-button" onClick={resetLeaderboard}><RotateCcw size={14} /> Reset leaderboard</button>}</div>
            {leaderboard.length > 0 && (
              <div className="leader-controls">
                <label className="search-field"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search players..." /></label>
                <label className="sort-select"><span>Sort by</span><select value={sortBy} onChange={(event) => setSortBy(event.target.value)}><option value="wins">Most wins</option><option value="winRate">Highest win %</option><option value="matches">Most matches</option></select><ChevronDown size={14} /></label>
              </div>
            )}
            {sortedPlayers.length ? (
              <div className="glass-card leaderboard-card">
                <div className="table-header"><span>RANK / PLAYER</span><span>MATCHES</span><span>W / L / D</span><span>WIN RATE</span></div>
                {sortedPlayers.map((player, index) => (
                  <div className={`leader-row ${index === 0 && sortBy === 'wins' ? 'top-player' : ''}`} key={player.name}>
                    <div className="leader-person"><span className={`rank-badge rank-${index + 1}`}>{index === 0 && sortBy === 'wins' ? <Crown size={15} /> : `#${index + 1}`}</span><span className="leader-avatar">{player.name.slice(0, 1).toUpperCase()}</span><div><b>{player.name}</b>{index === 0 && sortBy === 'wins' && <small>TOP PLAYER</small>}</div></div>
                    <strong>{player.matches}</strong><span>{player.wins}<i> / </i>{player.losses}<i> / </i>{player.draws}</span><div className="rate-cell"><b>{Math.round(player.wins / Math.max(player.matches, 1) * 100)}%</b><span className="rate-track"><i style={{ width: `${player.wins / Math.max(player.matches, 1) * 100}%` }} /></span></div>
                  </div>
                ))}
                <div className="table-legend">WINS <span>·</span> LOSSES <span>·</span> DRAWS</div>
              </div>
            ) : (
              <div className="empty-state glass-card"><span className="empty-icon"><Trophy size={25} /></span><h3>{search ? 'No players found' : 'No players yet.'}</h3><p>{search ? 'Try another name or clear your search.' : 'Play your first match to appear on the leaderboard.'}</p>{!search && <button className="button button-primary" onClick={() => setPage('setup')}>Start playing <ArrowRight size={16} /></button>}</div>
            )}
            <div className="page-footnote"><Shield size={15} /> Rankings are saved privately on this device.</div>
          </section>
        )}
        {page === 'stats' && (
          <StatsPage stats={stats} matches={matches} leaderboard={leaderboard} onReset={resetStatistics} onPlay={() => setPage('setup')} />
        )}
      </main>

      {showRules && <RulesModal onClose={() => setShowRules(false)} />}
      {toast && <div className="toast"><Sparkles size={16} />{toast}</div>}
      <footer className="site-footer"><span>© {new Date().getFullYear()} XO ARENA</span><span>GOOD GAMES. GREAT RIVALS.</span><button onClick={() => setShowRules(true)}><CircleHelp size={14} /> How to play</button></footer>
    </div>
  );
}

function HomePage({ stats, matches, onPlay, onLeaderboard, onRules }) {
  return (
    <section className="home-page">
      <div className="hero">
        <div className="hero-copy">
          <div className="hero-kicker"><span className="kicker-line" /> THE CLASSIC, REIMAGINED</div>
          <h1>Make your<br />move. <span>Own</span> the<br /><span className="gradient-word">arena.</span></h1>
          <p>One board. Two players. Infinite ways to outsmart your opponent. Your next great match starts right here.</p>
          <div className="hero-buttons"><button className="button button-primary hero-cta" onClick={onPlay}>Start a match <ArrowRight size={17} /></button><button className="button button-quiet" onClick={onRules}><CircleHelp size={16} /> How to play</button></div>
          <div className="hero-trust"><Trophy size={16} /><span><strong>{stats.totalGames.toLocaleString()}</strong> completed matches recorded</span></div>
        </div>
        <div className="hero-visual">
          <div className="orbit orbit-one" /><div className="orbit orbit-two" />
          <div className="floating-label label-top"><span className="label-dot" /> YOUR MOVE</div>
          <div className="hero-board">
            {Array(9).fill('').map((_, index) => <div key={index} className={`hero-cell ${index === 4 ? 'hero-focus' : ''}`}>{index === 4 && <i className="cell-glow" />}</div>)}
          </div>
          <div className="floating-label label-bottom"><span className="label-award"><Trophy size={14} /></span> YOUR NEXT MOVE STARTS HERE</div>
          <div className="float-chip chip-top"><Sparkles size={14} /><span><b>Strategy</b><small>beats luck</small></span></div>
          <div className="float-chip chip-bottom"><span className="chip-streak"><Flame size={15} /></span><span><b>{stats.bestStreak} win streak</b><small>your personal best</small></span></div>
        </div>
        <div className="hero-orb" />
      </div>
      <div className="feature-strip">
        <div className="feature-item"><span className="feature-icon purple"><Bot size={19} /></span><div><b>Play your way</b><small>Take on a clever AI or a friend</small></div></div>
        <div className="feature-item"><span className="feature-icon orange"><Trophy size={19} /></span><div><b>Climb the ranks</b><small>Every win brings bragging rights</small></div></div>
        <div className="feature-item"><span className="feature-icon green"><Shield size={19} /></span><div><b>Always fair</b><small>Private stats, saved on your device</small></div></div>
      </div>
      <section className="home-lower">
        <div><p className="eyebrow">YOUR ARENA</p><h2>Small board.<br /><span>Big energy.</span></h2></div>
        <div className="home-lower-right"><p>Bring your best strategy. We’ll keep score, remember the rivalries, and save you a seat for the rematch.</p><div className="home-quick-stats"><div><b>{stats.totalGames}</b><small>GAMES PLAYED</small></div><div><b>{stats.bestStreak}</b><small>BEST STREAK</small></div><button onClick={onLeaderboard}>View leaderboard <ArrowRight size={15} /></button></div></div>
      </section>
      {matches.length > 0 && <div className="recent-teaser"><History size={15} /><span>Last match: {matches[0].result === 'draw' ? 'Draw' : `${matches[0].winner === 'X' ? matches[0].xName : matches[0].oName} won`}</span><span className="recent-date">{new Date(matches[0].date).toLocaleDateString()}</span></div>}
    </section>
  );
}

function SetupPage({ settings, setSettings, onBack, onStart }) {
  const set = (key, value) => setSettings((current) => ({ ...current, [key]: value }));
  return (
    <section className="setup-page">
      <button className="back-link" onClick={onBack}><ArrowLeft size={16} /> Back</button>
      <div className="setup-heading"><p className="eyebrow">CHOOSE YOUR CHALLENGE</p><h1>Set the stage.</h1><p>Pick your game mode, choose your side, and let the games begin.</p></div>
      <div className="setup-grid">
        <div className="setup-main">
          <div className="setup-section"><div className="section-title"><span className="section-number">01</span><div><h3>Choose your game mode</h3><p>Solo showdown or friendly rivalry?</p></div></div>
            <div className="mode-options">
              <button className={`mode-option ${settings.mode === 'bot' ? 'selected' : ''}`} onClick={() => set('mode', 'bot')}><span className="mode-option-icon bot-icon"><Bot size={21} /></span><span className="option-copy"><b>Play vs. bot</b><small>A worthy opponent, anytime</small></span><span className="radio-dot" /></button>
              <button className={`mode-option ${settings.mode === 'multiplayer' ? 'selected' : ''}`} onClick={() => set('mode', 'multiplayer')}><span className="mode-option-icon duo-icon"><span>X</span><span>O</span></span><span className="option-copy"><b>Local multiplayer</b><small>Two players, one device</small></span><span className="radio-dot" /></button>
            </div>
          </div>
          {settings.mode === 'bot' ? (
            <>
              <div className="setup-section"><div className="section-title"><span className="section-number">02</span><div><h3>Pick your difficulty</h3><p>How tough should the bot be?</p></div></div>
                    <div className="difficulty-options">
                      {[['easy', 'Easy', 'A little practice'], ['medium', 'Medium', 'A balanced challenge'], ['hard', 'Hard', 'Think you can beat it?']].map(([value, name, copy], index) => <button key={value} onClick={() => set('difficulty', value)} className={`difficulty-card ${settings.difficulty === value ? 'selected' : ''}`}><span className={`difficulty-gem gem-${value}`}>{['✳', '◈', '⚡'][index]}</span><b>{name}</b><small>{copy}</small>{settings.difficulty === value && <span className="selected-tick">✓</span>}</button>)}
                </div>
              </div>
              <div className="setup-section"><div className="section-title"><span className="section-number">03</span><div><h3>Choose your symbol</h3><p>You’ll always make the first move as X.</p></div></div>
                <div className="symbol-picker">{['X', 'O'].map((mark) => <button key={mark} onClick={() => set('humanMark', mark)} className={`symbol-choice ${settings.humanMark === mark ? 'selected' : ''}`}><span className={mark === 'X' ? 'symbol-x' : 'symbol-o'}>{mark}</span><span>{mark === settings.humanMark ? 'You' : 'Arena Bot'}</span>{settings.humanMark === mark && <i>✓</i>}</button>)}</div>
              </div>
              <div className="setup-section compact-section"><label className="input-label">Your player name<input value={settings.humanMark === 'X' ? settings.playerX : settings.playerO} onChange={(event) => set(settings.humanMark === 'X' ? 'playerX' : 'playerO', event.target.value)} maxLength={20} placeholder="Enter your name" /></label></div>
            </>
          ) : (
            <div className="setup-section"><div className="section-title"><span className="section-number">02</span><div><h3>Meet the players</h3><p>Pick names and take your places.</p></div></div>
              <div className="name-fields"><label className="input-label">Player X<input value={settings.playerX} onChange={(event) => set('playerX', event.target.value)} maxLength={20} placeholder="Player X" /></label><label className="input-label">Player O<input value={settings.playerO} onChange={(event) => set('playerO', event.target.value)} maxLength={20} placeholder="Player O" /></label></div>
            </div>
          )}
        </div>
        <aside className="setup-aside glass-card"><div className="preview-kicker"><span className="live-dot" /> MATCH PREVIEW</div><div className="preview-board">{Array(9).fill('').map((_, i) => <span key={i} />)}</div><h3>{settings.mode === 'bot' ? `${settings.difficulty[0].toUpperCase()}${settings.difficulty.slice(1)} bot` : 'Local multiplayer'}</h3><p>{settings.mode === 'bot' ? `You’re ${settings.humanMark}. The bot takes ${settings.humanMark === 'X' ? 'O' : 'X'}.` : `${settings.playerX.trim() || 'Player X'} plays X. ${settings.playerO.trim() || 'Player O'} plays O.`}</p><div className="preview-detail"><span>MODE</span><b>{settings.mode === 'bot' ? 'VS. BOT' : 'TWO PLAYERS'}</b></div>{settings.mode === 'bot' && <div className="preview-detail"><span>DIFFICULTY</span><b>{settings.difficulty.toUpperCase()}</b></div>}<button className="button button-primary full-button" onClick={onStart}>Let’s play <ArrowRight size={17} /></button><div className="privacy-note"><Shield size={13} /> No account needed. Stats save on this device.</div></aside>
      </div>
    </section>
  );
}

function PageHeading({ eyebrow, title, description, icon: Icon }) {
  return <div className="page-heading"><span className="heading-icon"><Icon size={21} /></span><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{description}</p></div></div>;
}

function Confetti() {
  return <div className="confetti-layer" aria-hidden="true">{Array.from({ length: 34 }, (_, index) => <i key={index} style={{ '--confetti-index': index, '--confetti-x': `${(index * 37) % 100}%`, '--confetti-delay': `${(index % 9) * -0.17}s` }} />)}</div>;
}

function StatsPage({ stats, matches, leaderboard, onReset, onPlay }) {
  const topPlayer = [...leaderboard].sort((a, b) => b.wins - a.wins)[0];
  return (
    <section className="subpage stats-page">
      <PageHeading eyebrow="THE NUMBERS GAME" title="Your stats" description="Every move leaves a mark. Here’s yours." icon={BarChart3} />
      <div className="stats-grid">
        <StatCard label="Total games" value={stats.totalGames} icon={Gamepad2} tone="purple" />
        <StatCard label="X victories" value={stats.xWins} icon={spanX} tone="blue" />
        <StatCard label="O victories" value={stats.oWins} icon={spanO} tone="pink" />
        <StatCard label="Draws" value={stats.draws} icon={Shield} tone="green" />
        <StatCard label="Bot victories" value={stats.botWins} icon={Bot} tone="orange" />
        <StatCard label="Current streak" value={stats.currentStreak} icon={Flame} tone="pink" />
        <StatCard label="Best streak" value={stats.bestStreak} icon={Award} tone="orange" />
        <StatCard label="Top player" value={topPlayer?.name || '—'} icon={Crown} tone="purple" small />
      </div>
      <div className="history-section"><div className="history-heading"><div><p className="eyebrow">THE ARCHIVE</p><h2>Match history</h2></div><span>{matches.length} {matches.length === 1 ? 'match' : 'matches'}</span></div>
        {matches.length ? <div className="glass-card history-card">{matches.slice(0, 12).map((match) => <div className="history-row" key={match.id}><span className={`history-result ${match.result}`}>{match.result === 'draw' ? '—' : match.winner}</span><div className="history-vs"><b>{match.result === 'draw' ? 'Draw game' : `${match.winner === 'X' ? match.xName : match.oName} won`}</b><small>{match.xName} <i>vs</i> {match.oName}</small></div><span className="history-mode">{match.mode === 'bot' ? `${match.difficulty} bot` : 'multiplayer'}</span><span className="history-date">{new Date(match.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span></div>)}</div> : <div className="empty-history glass-card"><History size={21} /><span>Your match history will show up here.</span></div>}
      </div>
      <div className="stats-actions"><button className="button button-primary" onClick={onPlay}>Play a match <ArrowRight size={16} /></button><button className="text-button danger-text" onClick={onReset}><RotateCcw size={15} /> Reset all statistics</button></div>
    </section>
  );
}

function spanX() { return <span className="stat-symbol symbol-x">X</span>; }
function spanO() { return <span className="stat-symbol symbol-o">O</span>; }

function StatCard({ label, value, icon: Icon, tone, small }) {
  return <div className="stat-card glass-card"><span className={`stat-icon ${tone}`}>{typeof Icon === 'function' && Icon.prototype?.isReactComponent ? <Icon size={18} /> : <Icon size={18} />}</span><span className="stat-label">{label}</span><strong className={small ? 'stat-name' : ''}>{value}</strong></div>;
}

function RulesModal({ onClose }) {
  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="rules-modal glass-card" role="dialog" aria-modal="true" aria-labelledby="rules-title"><button className="modal-close icon-button" onClick={onClose} aria-label="Close"><X size={18} /></button><span className="rules-icon"><CircleHelp size={22} /></span><p className="eyebrow">THE PLAYBOOK</p><h2 id="rules-title">Three in a row.<br /><span>That’s the whole show.</span></h2><p className="rules-intro">The rules are simple. The strategy is where the fun begins.</p><div className="rule-list"><div><b>01</b><p><strong>Take turns</strong><span>Players alternate, placing X or O in any empty square.</span></p></div><div><b>02</b><p><strong>Make your line</strong><span>Get three of your marks in a row — across, down, or diagonal.</span></p></div><div><b>03</b><p><strong>Play smart</strong><span>Block your rival, watch the corners, and never underestimate the center.</span></p></div></div><button className="button button-primary full-button" onClick={onClose}>Got it, let’s play <ArrowRight size={16} /></button></section></div>;
}

function playSound(type) {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.connect(gain);
    gain.connect(context.destination);
    const frequencies = type === 'win' ? [523.25, 659.25, 783.99] : type === 'draw' ? [392, 349.23] : [440];
    oscillator.frequency.value = frequencies[0];
    oscillator.type = 'sine';
    gain.gain.setValueAtTime(0.06, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.18);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.18);
    if (type !== 'move') {
      frequencies.slice(1).forEach((frequency, index) => {
        const note = context.createOscillator();
        const noteGain = context.createGain();
        note.connect(noteGain);
        noteGain.connect(context.destination);
        note.frequency.value = frequency;
        note.type = 'sine';
        const start = context.currentTime + (index + 1) * 0.14;
        noteGain.gain.setValueAtTime(0.05, start);
        noteGain.gain.exponentialRampToValueAtTime(0.001, start + 0.2);
        note.start(start);
        note.stop(start + 0.2);
      });
    }
    window.setTimeout(() => context.close(), 1000);
  } catch (error) {
    console.error('Unable to play the game sound.', error);
  }
}

export default App;
