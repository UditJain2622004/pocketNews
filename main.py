from fastapi import FastAPI
from fastapi.responses import HTMLResponse

app = FastAPI(
    title="PocketNews API",
    description="A basic FastAPI application for PocketNews",
    version="0.1.0"
)

@app.get("/", response_class=HTMLResponse)
def read_root():
    return """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>PocketNews API</title>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <style>
            :root {
                --bg-gradient: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
                --card-bg: rgba(255, 255, 255, 0.03);
                --card-border: rgba(255, 255, 255, 0.08);
                --text-primary: #f8fafc;
                --text-secondary: #94a3b8;
                --accent-color: #6366f1;
                --accent-gradient: linear-gradient(135deg, #818cf8 0%, #6366f1 100%);
            }
            
            body {
                margin: 0;
                font-family: 'Plus Jakarta Sans', sans-serif;
                background: var(--bg-gradient);
                color: var(--text-primary);
                min-height: 100vh;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                overflow: hidden;
            }

            .container {
                text-align: center;
                backdrop-filter: blur(16px);
                background: var(--card-bg);
                border: 1px solid var(--card-border);
                padding: 3rem;
                border-radius: 24px;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                max-width: 500px;
                width: 90%;
                animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1);
            }

            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }

            .logo-container {
                width: 80px;
                height: 80px;
                background: var(--accent-gradient);
                border-radius: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 2rem;
                box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.4);
            }

            .logo-icon {
                font-size: 2.5rem;
            }

            h1 {
                margin: 0 0 0.5rem;
                font-size: 2.25rem;
                font-weight: 700;
                letter-spacing: -0.025em;
                background: linear-gradient(to right, #ffffff, #c7d2fe);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }

            .status {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                background: rgba(16, 185, 129, 0.1);
                color: #34d399;
                padding: 6px 16px;
                border-radius: 9999px;
                font-size: 0.875rem;
                font-weight: 500;
                border: 1px solid rgba(16, 185, 129, 0.2);
                margin-bottom: 1.5rem;
            }

            .status-dot {
                width: 8px;
                height: 8px;
                background-color: #10b981;
                border-radius: 50%;
                box-shadow: 0 0 10px #10b981;
                animation: pulse 1.5s infinite;
            }

            @keyframes pulse {
                0% { transform: scale(0.9); opacity: 0.6; }
                50% { transform: scale(1.1); opacity: 1; }
                100% { transform: scale(0.9); opacity: 0.6; }
            }

            p {
                color: var(--text-secondary);
                line-height: 1.6;
                margin-bottom: 2rem;
            }

            .btn-group {
                display: flex;
                gap: 12px;
                justify-content: center;
            }

            .btn {
                text-decoration: none;
                padding: 12px 24px;
                border-radius: 12px;
                font-weight: 600;
                font-size: 0.95rem;
                transition: all 0.2s ease;
            }

            .btn-primary {
                background: var(--accent-gradient);
                color: white;
                box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
            }

            .btn-primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
            }

            .btn-secondary {
                background: transparent;
                color: var(--text-primary);
                border: 1px solid var(--card-border);
            }

            .btn-secondary:hover {
                background: rgba(255, 255, 255, 0.05);
                border-color: rgba(255, 255, 255, 0.2);
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="logo-container">
                <span class="logo-icon">📰</span>
            </div>
            <h1>PocketNews API</h1>
            <div class="status">
                <span class="status-dot"></span>
                <span>Active & Running</span>
            </div>
            <p>Welcome to the PocketNews FastAPI backend. The API service is fully functional and ready to accept requests.</p>
            <div class="btn-group">
                <a href="/docs" class="btn btn-primary">Interactive Docs</a>
                <a href="/redoc" class="btn btn-secondary">ReDoc</a>
            </div>
        </div>
    </body>
    </html>
    """

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "PocketNews API"}
