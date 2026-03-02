# Supply Chain Control Tower - Technology Stack

This document outlines the core technologies, frameworks, and libraries used to build the Supply Chain Control Tower application. The project is structured as a modern web application with a decoupled frontend and backend architecture.

## 🎨 Frontend Stack

The user interface is built for high performance, responsiveness, and a modern aesthetic, utilizing a component-based architecture.

*   **Core Framework**: [React](https://react.dev/) (JavaScript library for building user interfaces)
*   **Build Tool**: [Vite](https://vitejs.dev/) (Next-generation, blazing fast frontend tooling)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) (Utility-first CSS framework for rapid UI development)
*   **Routing**: [React Router DOM](https://reactrouter.com/) (Declarative routing for React web applications)
*   **Icons**: [Lucide React](https://lucide.dev/) (Beautiful & consistent icon toolkit)
*   **Data Visualization**: [Recharts](https://recharts.org/) (A composable charting library built on React components)

## ⚙️ Backend Stack

The backend serves as a robust API layer, handling data processing, database interactions, and real-time metric streams.

*   **Language**: [Python 3.x](https://www.python.org/)
*   **Web Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Modern, fast web framework for building APIs with Python)
*   **ASGI Server**: [Uvicorn](https://www.uvicorn.org/) (Lightning-fast ASGI server implementation)
*   **Data Processing**: 
    *   [Pandas](https://pandas.pydata.org/) (Powerful data structures for data analysis and manipulation)
    *   [NumPy](https://numpy.org/) (Fundamental package for scientific computing)
*   **Real-time Communication**: [WebSockets](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API) (Used via FastAPI to stream live KPI updates to the dashboard)

## 🗄️ Database & Storage

*   **Database**: [SQLite](https://www.sqlite.org/index.html) (C-language library that implements a small, fast, self-contained, high-reliability, full-featured, SQL database engine)
*   **ORM**: [SQLAlchemy](https://www.sqlalchemy.org/) (Python SQL toolkit and Object Relational Mapper)
*   **Data Ingestion**: Custom Python scripts (e.g., `convert_excel_to_sqlite.py`) exist to extract raw supply chain mock data from Excel files and load them into the relational database structure.

## 🏗️ Architecture Overview

1.  **Client-Side Rendering**: The React frontend is served as a Single Page Application (SPA), providing smooth transitions between the Control Tower, Optimizer, Network Map, and Exceptions modules.
2.  **RESTful API**: FastAPI exposes standard HTTP endpoints for fetching historical dashboard details, filters, map nodes, and specific exception records.
3.  **Real-Time Data Streaming**: A persistent WebSocket connection is established between the React client and FastAPI server to continuously push fluctuating Key Performance Indicators (KPIs) to the dashboard tiles without requiring manual page refreshes.
4.  **In-Memory Analytics**: The backend heavily leverages Pandas DataFrames to perform fast aggregations, grouping, and scenario filtering (e.g., by Time, Region, Product Family) on the SQL data before sending it to the client.
