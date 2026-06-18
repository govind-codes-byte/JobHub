JobHub — Full Stack Job Portal

A production-ready job portal platform built with **FastAPI**, **React 18 + TypeScript**, **MongoDB Atlas**, and **Tailwind CSS**. Designed to resemble a real-world SaaS product like LinkedIn Jobs.

Live- https://job-hub-opal.vercel.app


Backend- 
cd JobHub/backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn app.main:app --reload --port 8000