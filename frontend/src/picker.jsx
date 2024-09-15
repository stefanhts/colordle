import { useState, useEffect } from "react";
import { HelpCircle } from "lucide-react";
import { colors } from "../colors.js";

const today = new Date().toISOString().split("T")[0];
const COLOR = colors[today];
const AllowedGuesses = 5;

const getDistance = (guess) => {
  const colorParts = COLOR.slice(1)
    .split("")
    .map((v) => parseInt(v, 16));
  let res = [];
  guess.split("").forEach((guess, index) => {
    res.push(Math.abs(parseInt(guess, 16) - colorParts[index]));
  });
  return res;
};

const DailyColorGuessingGame = () => {
  const [color, setColor] = useState(COLOR);
  const [guess, setGuess] = useState("");
  const [guesses, setGuesses] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [message, setMessage] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [shareableResult, setShareableResult] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);
  const [nextGameTime, setNextGameTime] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGameState = () => {
      const savedState = JSON.parse(
        localStorage.getItem("dailyColorGuessingGameState"),
      );
      const today = new Date().toDateString();

      if (savedState && savedState.date === today) {
        setColor(savedState.color);
        setGuesses(savedState.guesses);
        setFeedback(savedState.feedback);
        setGameOver(savedState.gameOver);
        setShareableResult(savedState.shareableResult);
        setNextGameTime(savedState.nextGameTime);
      } else {
        startNewGame();
      }
      setLoading(false); // Set loading to false after loading the state
    };

    loadGameState();
  }, []);

  useEffect(() => {
    if (!loading) {
      // Check if loading is done
      saveGameState();
    }
  }, [guesses, feedback, nextGameTime, loading, gameOver]);

  const saveGameState = () => {
    const stateToSave = {
      date: new Date().toDateString(),
      color,
      guesses,
      feedback,
      gameOver,
      shareableResult,
      nextGameTime,
    };
    localStorage.setItem(
      "dailyColorGuessingGameState",
      JSON.stringify(stateToSave),
    );
  };

  const startNewGame = () => {
    setColor(COLOR);
    setNextGameTime(getNextGameTime());
  };

  const getNextGameTime = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow.getTime();
  };

  useEffect(() => {
    if (guesses.length > 0 && (gameOver || guess === color.slice(1))) {
      const result = generateShareableResult(guesses, feedback);
      setShareableResult(result);
    }
  }, [guesses, feedback, gameOver]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (guess.match(/^[A-Fa-f0-9]{6}$/)) {
      const newFeedback = calculateFeedback(guess);
      setGuesses([...guesses, guess]);
      setFeedback([...feedback, newFeedback]);

      if (guess === color.slice(1)) {
        setMessage("Congratulations! You guessed the color!");
        setGameOver(true); // set gameOver to true

        // Generate the result immediately after setting gameOver
        const result = generateShareableResult(
          [...guesses, guess],
          [...feedback, newFeedback],
        );
        setShareableResult(result);
      } else if (guesses.length >= AllowedGuesses - 1) {
        setMessage(`Game over! The color was ${color}`);
        setGameOver(true);

        // Generate the result for a failed game
        const result = generateShareableResult(
          [...guesses, guess],
          [...feedback, newFeedback],
        );
        setShareableResult(result);
      }
      setGuess("");
    } else {
      setMessage("Please enter a valid hex color code (e.g., RRGGBB)");
    }
  };

  const calculateFeedback = (guessColor) => {
    return getDistance(guessColor).map((dist) => {
      if (dist === 0) {
        return "green";
      }

      if (dist <= 2) {
        return "yellow";
      }
      return "grey";
    });
    // ... (implementation remainsko the same)
  };

  const generateShareableResult = (latestGuess, latestFeedback) => {
    const emojiMap = {
      green: "🟩",
      yellow: "🟨",
      grey: "⬜",
    };

    const allGuesses = [...guesses, latestGuess];
    const allFeedback = [...feedback, latestFeedback];

    let result = `Color Guessing Game ${allGuesses.length - 1}/${AllowedGuesses}\n\n`;

    // Check if allFeedback has valid values

    allFeedback.forEach((guessFeedback) => {
      result += guessFeedback.map((color) => emojiMap[color]).join("") + "\n";
    });

    result += `\nPlay at: https://colordle.stefanhts.dev`; // Replace with actual game URL

    // Debugging output to ensure result is valid

    return result;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareableResult).then(() => {
      setMessage("Result copied to clipboard!");
    });
  };

  const rules = `
    1. Guess the daily hidden color's hex code.
    2. Enter a valid hex code (e.g., #RRGGBB).
    3. You have ${AllowedGuesses} attempts to guess correctly.
    4. After each guess, you'll get feedback:
       🟩 - Correct digit
       🟨 - Close digit
       ⬜ - Incorrect digit
    5. A new color is available each day at midnight.
  `;

  const timeUntilNextGame = () => {
    if (!nextGameTime) return "";
    const now = new Date().getTime();
    const timeLeft = nextGameTime - now;
    if (timeLeft <= 0) return "New game available now!";

    const hours = Math.floor(
      (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    );
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    return `Next game in ${hours}h ${minutes}m ${seconds}s`;
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        width: "100%",
        backgroundColor: "#f0f8ff",
        fontFamily: "Arial, sans-serif",
        color: "#333",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "800px",
          padding: "2rem",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            position: "relative",
            marginBottom: "2rem",
            textAlign: "center",
          }}
        >
          <h1
            style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#2c3e50" }}
          >
            Daily Color Guessing Game
          </h1>
          <div
            style={{
              position: "absolute",
              top: "50%",
              right: "-3rem",
              transform: "translateY(-50%)",
              cursor: "pointer",
            }}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <HelpCircle size={24} color="#3498db" />
          </div>
          {showTooltip && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                right: "-3rem",
                width: "300px",
                padding: "1rem",
                backgroundColor: "white",
                border: "1px solid #bdc3c7",
                borderRadius: "0.5rem",
                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                zIndex: 100,
                whiteSpace: "pre-wrap",
                textAlign: "left",
                color: "#34495e",
              }}
            >
              {rules}
            </div>
          )}
        </div>

        <div
          style={{
            width: "200px",
            height: "200px",
            margin: "0 auto 2rem",
            border: "4px solid #bdc3c7",
            borderRadius: "1rem",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            backgroundColor: color,
          }}
        ></div>

        {!gameOver && (
          <form
            onSubmit={handleSubmit}
            style={{ marginBottom: "2rem", textAlign: "center" }}
          >
            <input
              type="text"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder="Enter hexcode (e.g., #RRGGBB)"
              style={{
                padding: "0.75rem 1rem",
                border: "2px solid #bdc3c7",
                borderRadius: "0.5rem",
                marginRight: "0.5rem",
                fontSize: "1rem",
                width: "200px",
              }}
            />
            <button
              type="submit"
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: "#3498db",
                color: "white",
                border: "none",
                borderRadius: "0.5rem",
                cursor: "pointer",
                fontSize: "1rem",
                transition: "background-color 0.3s ease",
              }}
            >
              Guess
            </button>
          </form>
        )}

        {message && (
          <div
            style={{
              padding: "1rem",
              borderRadius: "0.5rem",
              backgroundColor: message.startsWith("Congratulations")
                ? "#d4edda"
                : "#f8d7da",
              marginBottom: "1rem",
              textAlign: "center",
              maxWidth: "300px",
              margin: "0 auto 1rem",
            }}
          >
            <p
              style={{
                fontWeight: "bold",
                color: message.startsWith("Congratulations")
                  ? "#155724"
                  : "#721c24",
              }}
            >
              {message}
            </p>
          </div>
        )}

        <div
          style={{
            marginBottom: "2rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {guesses.map((g, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: "0.5rem",
                gap: "0.5rem",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: "1.5rem",
                  height: "1.5rem",
                  backgroundColor: `#${g}`,
                  borderRadius: "0.25rem",
                }}
              ></span>
              <div style={{ color: "#34495e", fontFamily: "Courier New, monospace", fontSize: "1.1em"}}>#{g}</div>
              <div style={{ display: "flex" }}>
                {feedback[i].map((f, j) => (
                  <span
                    key={j}
                    style={{
                      display: "inline-block",
                      width: "1.5rem",
                      height: "1.5rem",
                      backgroundColor: f,
                      marginRight: "0.25rem",
                      borderRadius: "0.25rem",
                    }}
                  ></span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {gameOver && shareableResult && (
          <div style={{ marginTop: "2rem", textAlign: "center" }}>
            <h3 style={{ color: "#2c3e50", marginBottom: "1rem" }}>
              Share your result:
            </h3>
            <pre
              style={{
                backgroundColor: "#ecf0f1",
                padding: "1rem",
                borderRadius: "0.5rem",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                maxWidth: "300px",
                margin: "0 auto",
                color: "#34495e",
              }}
            >
              {shareableResult}
            </pre>
            <button
              onClick={copyToClipboard}
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: "#2ecc71",
                color: "white",
                border: "none",
                borderRadius: "0.5rem",
                cursor: "pointer",
                fontSize: "1rem",
                marginTop: "1rem",
                transition: "background-color 0.3s ease",
              }}
            >
              Copy to Clipboard
            </button>
          </div>
        )}

        <div
          style={{ marginTop: "2rem", textAlign: "center", color: "#34495e" }}
        >
          {timeUntilNextGame()}
        </div>
      </div>
    </div>
  );
};

export default DailyColorGuessingGame;
