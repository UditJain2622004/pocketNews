### FastAPI News Collection Endpoints:

## Added POST /api/news/sync in 
main.py to trigger bulk news collection in the background.

## Added GET /api/news/local in 
main.py to retrieve locally archived news JSON entries for a category and date.

## Command to start the backend
.venv\Scripts\uvicorn main:app --reload

## Command to start the frontend
npm run dev
