import { useState, useEffect, useCallback } from "react";

// ─── Game Data ───────────────────────────────────────────────────────────────
const SNAKES = {
  99: 21, 94: 56, 87: 24, 62: 19, 54: 34, 17: 7
};

const LADDERS = {
  4: 14, 9: 31, 20: 38, 28: 84, 40: 59, 51: 67, 63: 81, 71: 91
};

const PLAYER_COLORS = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4"];
const PLAYER_NAMES = ["Player 1", "Player 2", "Player 3", "Player 4"];
const PLAYER_EMOJIS = ["🔴", "🟡", "🟢", "🔵"];

// ─── Board Layout Helpers ─────────────────────────────────────────────────────
function getCellPosition(cellNumber) {
  const row = Math.floor((cellNumber - 1) / 10);
  const col = row % 2 === 0
    ? (cellNumber - 1) % 10
    : 9 - (cellNumber - 1) % 10;
  const boardRow = 9 - row;
  return { row: boardRow, col };
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SnakesAndLadders() {
  const [numPlayers, setNumPlayers] = useState(2);
  const [gameStarted, setGameStarted] = useState(false);
  const [positions, setPositions] = useState([0, 0, 0, 0]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [diceValue, setDiceValue] = useState(null);
  const [rolling, setRolling] = useState(false);
  const [log, setLog] = useState([]);
  const [winner, setWinner] = useState(null);
  const [animating, setAnimating] = useState(false);
  const [highlight, setHighlight] = useState(null); // { from, to, type }

  const resetGame = () => {
    setPositions([0, 0, 0, 0]);
    setCurrentPlayer(0);
    setDiceValue(null);
    setRolling(false);
    setLog([]);
    setWinner(null);
    setAnimating(false);
    setHighlight(null);
    setGameStarted(false);
  };

  const startGame = () => {
    setPositions(Array(numPlayers).fill(0));
    setCurrentPlayer(0);
    setDiceValue(null);
    setRolling(false);
    setLog([`🎮 Game started with ${numPlayers} players! ${PLAYER_EMOJIS[0]} ${PLAYER_NAMES[0]}'s turn.`]);
    setWinner(null);
    setAnimating(false);
    setHighlight(null);
    setGameStarted(true);
  };

  const rollDice = useCallback(() => {
    if (rolling || animating || winner) return;

    setRolling(true);
    setHighlight(null);

    // Animate dice
    let count = 0;
    const interval = setInterval(() => {
      setDiceValue(Math.ceil(Math.random() * 6));
      count++;
      if (count >= 10) {
        clearInterval(interval);
        const finalDice = Math.ceil(Math.random() * 6);
        setDiceValue(finalDice);
        setRolling(false);
        processMove(finalDice);
      }
    }, 60);
  }, [rolling, animating, winner, positions, currentPlayer, numPlayers, log]);

  const processMove = (dice) => {
    setAnimating(true);
    setPositions(prev => {
      const newPositions = [...prev];
      const oldPos = newPositions[currentPlayer];
      let newPos = oldPos + dice;
      const playerName = PLAYER_NAMES[currentPlayer];
      const emoji = PLAYER_EMOJIS[currentPlayer];
      const newLog = [...log];

      if (newPos > 100) {
        newLog.push(`${emoji} ${playerName} rolled ${dice} — needs exact roll to win! Stays at ${oldPos}.`);
        setLog(newLog);
        setAnimating(false);
        setCurrentPlayer(cur => (cur + 1) % numPlayers);
        return prev;
      }

      newLog.push(`${emoji} ${playerName} rolled ${dice} → moved to ${newPos}`);

      if (SNAKES[newPos]) {
        const snakeTail = SNAKES[newPos];
        setTimeout(() => setHighlight({ from: newPos, to: snakeTail, type: "snake" }), 300);
        newLog.push(`🐍 Oops! Snake at ${newPos}! ${playerName} slides down to ${snakeTail}`);
        newPos = snakeTail;
      } else if (LADDERS[newPos]) {
        const ladderTop = LADDERS[newPos];
        setTimeout(() => setHighlight({ from: newPos, to: ladderTop, type: "ladder" }), 300);
        newLog.push(`🪜 Ladder at ${newPos}! ${playerName} climbs up to ${ladderTop}`);
        newPos = ladderTop;
      }

      newPositions[currentPlayer] = newPos;

      if (newPos === 100) {
        newLog.push(`🏆 ${emoji} ${playerName} WINS THE GAME! 🎉`);
        setWinner(currentPlayer);
      }

      setLog(newLog);
      setTimeout(() => {
        setAnimating(false);
        if (newPos !== 100) {
          setCurrentPlayer(cur => (cur + 1) % numPlayers);
        }
      }, 600);

      return newPositions;
    });
  };

  // Auto-scroll log
  useEffect(() => {
    const el = document.getElementById("game-log");
    if (el) el.scrollTop = el.scrollHeight;
  }, [log]);

  const DICE_FACES = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
      fontFamily: "'Georgia', serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "24px 16px",
      color: "#fff",
    }}>
      {/* Title */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <h1 style={{
          fontSize: "clamp(2rem, 5vw, 3.2rem)",
          fontWeight: 900,
          letterSpacing: "0.05em",
          background: "linear-gradient(90deg, #FFD700, #FF6B6B, #4ECDC4)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          margin: 0,
          textShadow: "none",
        }}>
          🐍 Snakes & Ladders 🪜
        </h1>
        <p style={{ color: "#aaa", margin: "6px 0 0", fontSize: "1rem", letterSpacing: "0.12em" }}>
          CLASSIC BOARD GAME
        </p>
      </div>

      {!gameStarted ? (
        // ── Setup Screen ──
        <div style={{
          background: "rgba(255,255,255,0.07)",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: 20,
          padding: "36px 44px",
          maxWidth: 400,
          width: "100%",
          textAlign: "center",
          backdropFilter: "blur(10px)",
        }}>
          <h2 style={{ margin: "0 0 24px", fontSize: "1.4rem", color: "#FFD700" }}>Choose Players</h2>
          <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 32 }}>
            {[2, 3, 4].map(n => (
              <button
                key={n}
                onClick={() => setNumPlayers(n)}
                style={{
                  width: 64, height: 64, borderRadius: 16,
                  border: numPlayers === n ? "3px solid #FFD700" : "2px solid rgba(255,255,255,0.2)",
                  background: numPlayers === n ? "rgba(255,215,0,0.15)" : "rgba(255,255,255,0.05)",
                  color: numPlayers === n ? "#FFD700" : "#ccc",
                  fontSize: "1.5rem", fontWeight: 700, cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {n}
              </button>
            ))}
          </div>
          <div style={{ marginBottom: 28 }}>
            {Array.from({ length: numPlayers }, (_, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 10,
                marginBottom: 8, padding: "8px 14px",
                background: "rgba(255,255,255,0.05)", borderRadius: 10,
              }}>
                <span style={{ fontSize: "1.4rem" }}>{PLAYER_EMOJIS[i]}</span>
                <span style={{ color: PLAYER_COLORS[i], fontWeight: 600 }}>{PLAYER_NAMES[i]}</span>
              </div>
            ))}
          </div>
          <button
            onClick={startGame}
            style={{
              width: "100%", padding: "14px",
              background: "linear-gradient(135deg, #FFD700, #FF6B6B)",
              border: "none", borderRadius: 14,
              color: "#1a1a2e", fontWeight: 800, fontSize: "1.1rem",
              cursor: "pointer", letterSpacing: "0.05em",
              boxShadow: "0 4px 24px rgba(255,107,107,0.4)",
              transition: "transform 0.15s",
            }}
            onMouseEnter={e => e.target.style.transform = "scale(1.03)"}
            onMouseLeave={e => e.target.style.transform = "scale(1)"}
          >
            🎮 START GAME
          </button>
        </div>
      ) : (
        // ── Game Screen ──
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 24,
          justifyContent: "center",
          width: "100%",
          maxWidth: 1000,
        }}>

          {/* Board */}
          <div style={{ position: "relative" }}>
            <div style={{
              display: "grid",
              gridTemplateRows: "repeat(10, 1fr)",
              gridTemplateColumns: "repeat(10, 1fr)",
              width: "min(480px, 90vw)",
              height: "min(480px, 90vw)",
              border: "3px solid rgba(255,215,0,0.4)",
              borderRadius: 14,
              overflow: "hidden",
              boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
              position: "relative",
            }}>
              {Array.from({ length: 100 }, (_, i) => {
                const cellNum = i + 1;
                const { row, col } = getCellPosition(cellNum);
                const isSnakeHead = Object.keys(SNAKES).map(Number).includes(cellNum);
                const isLadderBottom = Object.keys(LADDERS).map(Number).includes(cellNum);
                const isSnakeTail = Object.values(SNAKES).map(Number).includes(cellNum);
                const isLadderTop = Object.values(LADDERS).map(Number).includes(cellNum);

                const playersHere = positions
                  .slice(0, numPlayers)
                  .map((pos, pi) => pos === cellNum ? pi : -1)
                  .filter(pi => pi !== -1);

                const isHighlightFrom = highlight?.from === cellNum;
                const isHighlightTo = highlight?.to === cellNum;

                let cellBg = (row + col) % 2 === 0
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(255,255,255,0.03)";

                if (isSnakeHead) cellBg = "rgba(255, 80, 80, 0.25)";
                else if (isLadderBottom) cellBg = "rgba(80, 220, 80, 0.25)";
                else if (isSnakeTail) cellBg = "rgba(255, 80, 80, 0.12)";
                else if (isLadderTop) cellBg = "rgba(80, 220, 80, 0.12)";

                if (isHighlightFrom || isHighlightTo) cellBg = "rgba(255,215,0,0.35)";

                return (
                  <div
                    key={cellNum}
                    style={{
                      gridRow: row + 1,
                      gridColumn: col + 1,
                      background: cellBg,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                      border: "1px solid rgba(255,255,255,0.06)",
                      transition: "background 0.3s",
                      fontSize: "clamp(5px, 1.2vw, 10px)",
                    }}
                  >
                    {/* Cell number */}
                    <span style={{
                      color: isSnakeHead || isSnakeTail ? "#ff8888"
                        : isLadderBottom || isLadderTop ? "#88ff88"
                        : "rgba(255,255,255,0.3)",
                      fontSize: "inherit",
                      lineHeight: 1,
                    }}>{cellNum}</span>

                    {/* Icon */}
                    {isSnakeHead && <span style={{ fontSize: "1.4em" }}>🐍</span>}
                    {isLadderBottom && <span style={{ fontSize: "1.4em" }}>🪜</span>}

                    {/* Players */}
                    {playersHere.length > 0 && (
                      <div style={{
                        position: "absolute", top: 1, right: 1,
                        display: "flex", flexWrap: "wrap", gap: 1,
                      }}>
                        {playersHere.map(pi => (
                          <div key={pi} style={{
                            width: "clamp(8px, 2vw, 14px)",
                            height: "clamp(8px, 2vw, 14px)",
                            borderRadius: "50%",
                            background: PLAYER_COLORS[pi],
                            border: `1.5px solid white`,
                            boxShadow: `0 0 6px ${PLAYER_COLORS[pi]}`,
                            animation: "pulse 1s infinite",
                          }} />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div style={{
              display: "flex", gap: 16, marginTop: 10,
              justifyContent: "center", fontSize: "0.8rem", color: "#ccc",
            }}>
              <span>🐍 Snake (slide down)</span>
              <span>🪜 Ladder (climb up)</span>
            </div>
          </div>

          {/* Side Panel */}
          <div style={{
            display: "flex", flexDirection: "column", gap: 16,
            width: "min(280px, 90vw)",
          }}>

            {/* Player Status */}
            <div style={{
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 16, padding: "16px",
              backdropFilter: "blur(8px)",
            }}>
              <h3 style={{ margin: "0 0 12px", color: "#FFD700", fontSize: "0.9rem", letterSpacing: "0.1em" }}>
                PLAYERS
              </h3>
              {Array.from({ length: numPlayers }, (_, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "8px 10px", borderRadius: 10, marginBottom: 6,
                  background: currentPlayer === i && !winner
                    ? `rgba(${i === 0 ? "255,107,107" : i === 1 ? "78,205,196" : i === 2 ? "69,183,209" : "150,206,180"},0.2)`
                    : "rgba(255,255,255,0.04)",
                  border: currentPlayer === i && !winner
                    ? `1.5px solid ${PLAYER_COLORS[i]}`
                    : "1.5px solid transparent",
                  transition: "all 0.3s",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{
                      width: 12, height: 12, borderRadius: "50%",
                      background: PLAYER_COLORS[i],
                      boxShadow: currentPlayer === i ? `0 0 8px ${PLAYER_COLORS[i]}` : "none",
                    }} />
                    <span style={{ fontSize: "0.85rem", color: currentPlayer === i ? "#fff" : "#aaa" }}>
                      {PLAYER_NAMES[i]}
                    </span>
                  </div>
                  <span style={{
                    fontWeight: 700, fontSize: "0.95rem",
                    color: PLAYER_COLORS[i],
                  }}>
                    {positions[i] === 0 ? "Start" : positions[i]}
                  </span>
                </div>
              ))}
            </div>

            {/* Dice + Roll */}
            {!winner && (
              <div style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 16, padding: "20px 16px",
                textAlign: "center",
                backdropFilter: "blur(8px)",
              }}>
                <p style={{ margin: "0 0 6px", color: "#aaa", fontSize: "0.8rem", letterSpacing: "0.1em" }}>
                  {PLAYER_EMOJIS[currentPlayer]} {PLAYER_NAMES[currentPlayer]}'s Turn
                </p>
                <div style={{
                  fontSize: "4.5rem", lineHeight: 1,
                  marginBottom: 16,
                  animation: rolling ? "spin 0.1s linear infinite" : "none",
                  filter: rolling ? "blur(1px)" : "none",
                  transition: "filter 0.1s",
                }}>
                  {diceValue ? DICE_FACES[diceValue] : "🎲"}
                </div>
                <button
                  onClick={rollDice}
                  disabled={rolling || animating}
                  style={{
                    width: "100%", padding: "13px",
                    background: rolling || animating
                      ? "rgba(255,255,255,0.1)"
                      : `linear-gradient(135deg, ${PLAYER_COLORS[currentPlayer]}, ${PLAYER_COLORS[(currentPlayer + 1) % numPlayers]})`,
                    border: "none", borderRadius: 12,
                    color: "#fff", fontWeight: 800, fontSize: "1rem",
                    cursor: rolling || animating ? "not-allowed" : "pointer",
                    letterSpacing: "0.05em",
                    boxShadow: rolling || animating ? "none" : `0 4px 20px rgba(0,0,0,0.3)`,
                    transition: "all 0.2s",
                  }}
                >
                  {rolling ? "Rolling..." : animating ? "Moving..." : "🎲 Roll Dice"}
                </button>
              </div>
            )}

            {/* Winner Banner */}
            {winner !== null && (
              <div style={{
                background: "linear-gradient(135deg, rgba(255,215,0,0.2), rgba(255,107,107,0.2))",
                border: "2px solid #FFD700",
                borderRadius: 16, padding: "20px",
                textAlign: "center",
                animation: "glow 1.5s ease-in-out infinite alternate",
              }}>
                <div style={{ fontSize: "3rem" }}>🏆</div>
                <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#FFD700", marginBottom: 4 }}>
                  {PLAYER_NAMES[winner]} Wins!
                </div>
                <div style={{ color: "#aaa", fontSize: "0.85rem", marginBottom: 16 }}>
                  Congratulations! 🎉
                </div>
                <button
                  onClick={resetGame}
                  style={{
                    padding: "10px 24px",
                    background: "linear-gradient(135deg, #FFD700, #FF6B6B)",
                    border: "none", borderRadius: 10,
                    color: "#1a1a2e", fontWeight: 800, cursor: "pointer",
                  }}
                >
                  Play Again
                </button>
              </div>
            )}

            {/* Snakes & Ladders Reference */}
            <div style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 14, padding: "14px 16px",
              fontSize: "0.75rem",
            }}>
              <div style={{ color: "#FFD700", fontWeight: 700, marginBottom: 8, letterSpacing: "0.08em" }}>SNAKES</div>
              {Object.entries(SNAKES).map(([h, t]) => (
                <div key={h} style={{ display: "flex", justifyContent: "space-between", color: "#ff8888", marginBottom: 3 }}>
                  <span>🐍 {h}</span><span>→ {t}</span>
                </div>
              ))}
              <div style={{ color: "#FFD700", fontWeight: 700, margin: "10px 0 8px", letterSpacing: "0.08em" }}>LADDERS</div>
              {Object.entries(LADDERS).map(([b, t]) => (
                <div key={b} style={{ display: "flex", justifyContent: "space-between", color: "#88ff88", marginBottom: 3 }}>
                  <span>🪜 {b}</span><span>→ {t}</span>
                </div>
              ))}
            </div>

            {/* Reset */}
            {!winner && (
              <button
                onClick={resetGame}
                style={{
                  padding: "10px", background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10,
                  color: "#aaa", cursor: "pointer", fontSize: "0.85rem",
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => { e.target.style.background = "rgba(255,255,255,0.12)"; e.target.style.color = "#fff"; }}
                onMouseLeave={e => { e.target.style.background = "rgba(255,255,255,0.06)"; e.target.style.color = "#aaa"; }}
              >
                ↩ Reset Game
              </button>
            )}
          </div>

          {/* Log */}
          <div style={{
            width: "min(760px, 90vw)",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 14,
            padding: "14px 16px",
            maxHeight: 140,
            overflow: "hidden",
          }}>
            <div style={{ color: "#FFD700", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 8 }}>
              GAME LOG
            </div>
            <div
              id="game-log"
              style={{
                maxHeight: 90, overflowY: "auto",
                display: "flex", flexDirection: "column", gap: 3,
              }}
            >
              {log.slice().reverse().map((entry, i) => (
                <div key={i} style={{
                  color: i === 0 ? "#fff" : "rgba(255,255,255,0.5)",
                  fontSize: "0.8rem", lineHeight: 1.4,
                }}>
                  {entry}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.85; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes glow {
          from { box-shadow: 0 0 10px rgba(255,215,0,0.3); }
          to { box-shadow: 0 0 30px rgba(255,215,0,0.7); }
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 2px; }
      `}</style>
    </div>
  );
}
