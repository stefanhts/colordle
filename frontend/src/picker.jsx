import { useState, useEffect } from 'react';
import { colors } from '../colors.js'
const today = new Date().toISOString().split('T')[0];
const COLOR = colors[today]
console.log(COLOR)


const getDistance = guess => {
    const colorParts = COLOR.slice(1).split('').map(v => parseInt(v, 16))
    let res = []
    guess.split('').forEach((guess, index) => {
        res.push(Math.abs(parseInt(guess, 16) - colorParts[index]))
    });
    console.log("res", res)
    return res
}

const ColorGuessingGame = () => {
    const [color, setColor] = useState(COLOR);
    const [guess, setGuess] = useState('');
    const [guesses, setGuesses] = useState([]);
    const [feedback, setFeedback] = useState([]);
    const [message, setMessage] = useState('');
    const [gameOver, setGameOver] = useState(false);
    const [shareableResult, setShareableResult] = useState('');

    useEffect(() => {
        setColor(COLOR);
    }, []);

    const generateShareableResult = (latestGuess, latestFeedback) => {
        const emojiMap = {
            'green': '🟩',
            'yellow': '🟨',
            'grey': '⬜'
        };

        const allGuesses = [...guesses, latestGuess];
        const allFeedback = [...feedback, latestFeedback];

        let result = `Color Guessing Game ${allGuesses.length}/5\n\n`;
        allFeedback.forEach((guess) => {
            result += guess.map(color => emojiMap[color]).join('') + '\n';
        });
        result += `\nPlay at: https://colordle.stefanhts.dev`; // Replace with your actual game URL

        setShareableResult(result);
    };

    const getFeedback = (guessColor) => {
        return getDistance(guessColor).map((dist) => {
            console.log(dist)
            if (dist === 0) {
                return 'green';
            }

            if (dist <= 2) {
                return 'yellow';
            }
            return 'grey';
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (guess.length !== 6) {
            setMessage('Please enter a valid hexcode (e.g., RRGGBB)');
            return;
        }
        const newGuesses = [...guesses, guess];
        setGuesses(newGuesses);
        const newFeedback = getFeedback(guess);
        console.log(newFeedback)
        setFeedback([...feedback, newFeedback]);

        if (guess.toLowerCase() === COLOR.toLowerCase().slice(1)) {
            setMessage('Congratulations! You guessed the color!');
            setGameOver(true);
            generateShareableResult(guess, newFeedback);
        } else if (newGuesses.length >= 5) {
            setMessage(`Game over! The correct color was ${color}`);
            setGameOver(true);
            generateShareableResult(guess, newFeedback);
        } else {
            setMessage(`Guess ${newGuesses.length}/5`);
        }
        setGuess('');
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(shareableResult).then(() => {
            alert('Result copied to clipboard!');
        }, (err) => {
            console.error('Could not copy text: ', err);
        });
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            backgroundColor: '#f0f0f0',
            padding: '1rem'
        }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Color Guessing Game</h1>
            <div
                style={{
                    width: '10rem',
                    height: '10rem',
                    marginBottom: '1rem',
                    border: '4px solid #ccc',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    backgroundColor: color
                }}
            ></div>
            <form onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
                <input
                    type="text"
                    value={guess}
                    onChange={(e) => setGuess(e.target.value)}
                    placeholder="Enter hexcode (e.g., #RRGGBB)"
                    disabled={gameOver}
                    style={{
                        padding: '0.5rem 1rem',
                        border: '1px solid #ccc',
                        borderRadius: '0.25rem',
                        marginRight: '0.5rem'
                    }}
                />
                <button
                    type="submit"
                    disabled={gameOver}
                    style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#3490dc',
                        color: 'blue',
                        border: 'none',
                        borderRadius: '0.25rem',
                        cursor: 'pointer'
                    }}
                >
                    Guess
                </button>
            </form>
            {message && (
                <div style={{
                    padding: '1rem',
                    borderRadius: '0.25rem',
                    backgroundColor: message.startsWith('Congratulations') ? '#c6f6d5' : '#fed7d7',
                    marginBottom: '1rem',
                    color: 'black'
                }}>
                    <p style={{ fontWeight: 'bold' }}>{message}</p>
                </div>
            )}
            <div style={{ marginBottom: '1rem' }}>
                {guesses.map((g, i) => (
                    <div key={i} style={{ display: 'flex', marginBottom: '0.5rem' }}>
                        <div style={{ color: 'black', marginRight: '0.5rem' }}>#{g}</div>
                        <div>
                            {feedback[i].map((f, j) => (
                                <span key={j} style={{
                                    color: 'black',
                                    display: 'inline-block',
                                    width: '1rem',
                                    height: '1rem',
                                    backgroundColor: f,
                                    marginRight: '0.25rem'
                                }}></span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            {gameOver && shareableResult && (
                <div style={{ marginTop: '1rem' }}>
                    <h3>Share your result:</h3>
                    <pre style={{
                        backgroundColor: '#e2f0e2',
                        padding: '0.5rem',
                        borderRadius: '0.25rem',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word'
                    }}>
                        {shareableResult}
                    </pre>
                    <button
                        onClick={copyToClipboard}
                        style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#4299e1',
                            color: 'blue',
                            border: 'none',
                            borderRadius: '0.25rem',
                            cursor: 'pointer',
                            marginTop: '0.5rem'
                        }}
                    >
                        Copy to Clipboard
                    </button>
                </div>
            )}
        </div>
    );
};

export default ColorGuessingGame;
