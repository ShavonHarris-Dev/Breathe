const JournalAndSketch = () => {
    const [activeTab, setActiveTab] = React.useState('journal');
    const [journalEntries, setJournalEntries] = React.useState([]);
    const [currentEntry, setCurrentEntry] = React.useState('');
    const canvasRef = React.useRef(null);
    const [isDrawing, setIsDrawing] = React.useState(false);
    const [currentColor, setCurrentColor] = React.useState('#456268');

    const colors = [
        '#456268', // Default app color
        '#89B6A5', // Primary color
        '#E8C5B0', // Accent color
        '#FF6B6B', // Warm red
        '#4ECDC4', // Teal
        '#45B7D1'  // Sky blue
    ];

    React.useEffect(() => {
        if (activeTab === 'sketch' && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            canvas.width = canvas.offsetWidth;
            canvas.height = 400;
            ctx.lineCap = 'round';
            ctx.strokeStyle = currentColor;
            ctx.lineWidth = 2;
        }
    }, [activeTab]);

    const startDrawing = (e) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        setIsDrawing(true);
        ctx.beginPath();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    const handleColorChange = (color) => {
        setCurrentColor(color);
        const ctx = canvasRef.current.getContext('2d');
        ctx.strokeStyle = color;
    };

    const handleJournalSubmit = (e) => {
        e.preventDefault();
        if (currentEntry.trim()) {
            setJournalEntries([
                {
                    id: Date.now(),
                    text: currentEntry,
                    date: new Date().toLocaleString()
                },
                ...journalEntries
            ]);
            setCurrentEntry('');
        }
    };

    return (
        <div className="journal-sketch-component">
            <div className="tab-container">
                <button 
                    className={`tab-button ${activeTab === 'journal' ? 'active' : ''}`}
                    onClick={() => setActiveTab('journal')}
                >
                    Let it go
                </button>
                <button 
                    className={`tab-button ${activeTab === 'sketch' ? 'active' : ''}`}
                    onClick={() => setActiveTab('sketch')}
                >
                    Sketch
                </button>
            </div>

            {activeTab === 'journal' && (
                <div className="journal-section">
                    <form onSubmit={handleJournalSubmit}>
                        <textarea
                            value={currentEntry}
                            onChange={(e) => setCurrentEntry(e.target.value)}
                            placeholder="Write your thoughts here..."
                            className="journal-input"
                        />
                        <button type="submit" className="primary-button">
                            Save Entry
                        </button>
                    </form>
                    <div className="journal-entries">
                        {journalEntries.map(entry => (
                            <div key={entry.id} className="journal-entry glass-effect">
                                <div className="entry-date">{entry.date}</div>
                                <div className="entry-text">{entry.text}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'sketch' && (
                <div className="sketch-section">
                    <div className="color-picker">
                        {colors.map(color => (
                            <button
                                key={color}
                                onClick={() => handleColorChange(color)}
                                className={`color-option ${currentColor === color ? 'active' : ''}`}
                                style={{ backgroundColor: color }}
                            />
                        ))}
                    </div>
                    <canvas
                        ref={canvasRef}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        className="sketch-canvas"
                    />
                    <button onClick={clearCanvas} className="clear-button">
                        Clear Canvas
                    </button>
                </div>
            )}
        </div>
    );
};

// Mount the component
const root = ReactDOM.createRoot(document.getElementById('journal-sketch-root'));
console.log('Mounting JournalAndSketch component...');
root.render(<JournalAndSketch />);
