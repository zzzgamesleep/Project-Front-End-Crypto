# Crypto Tracker - Full-Stack Cryptocurrency Monitoring Application

## Overview

Crypto Tracker is a full-stack web application for monitoring the cryptocurrency market. It features real-time price tracking, interactive historical charts (Line & Candlestick), a personalized watchlist (Favorites), and crypto news updates. Built with React (Frontend) and Node.js/Express (Backend) using a MySQL database.

## Key Features

*   **Real-time Data:** Track current crypto prices.
*   **Interactive Charts:** View historical Line & Candlestick charts (Recharts, React Financial Charts).
*   **Top 10 Volume:** Display top coins by 24h volume.
*   **News Feed:** Latest crypto market news.
*   **User Accounts:** Secure registration/login (JWT).
*   **Favorites:** Personalized coin watchlist for logged-in users.
*   **API Integration:** Fetches data from external crypto APIs (Binance/KuCoin, CoinGecko).

## Technologies

*   **Frontend:** React, React Router, Axios, Tailwind CSS, Recharts, React Financial Charts
*   **Backend:** Node.js, Express.js, MySQL, JWT, bcrypt, Axios
*   **Database:** MySQL
*   **APIs:** Binance/KuCoin, CoinGecko

## Quick Setup

**Prerequisites:** Node.js, npm/yarn, MySQL, Git

**1. Backend:**
   ```bash
   cd backend
   npm install
   # Setup MySQL database & tables (see user_table.sql, favorites_table.sql)
   # Create .env file with DB credentials & JWT_SECRET (see previous README for details)
   npm run dev 
   ```
   (Backend runs on `http://localhost:4000`)

**2. Frontend:**
   ```bash
   cd ../crypto-tracker
   npm install
   npm start
   ```
   (Frontend runs on `http://localhost:3000`)

## Usage

1.  Start both backend and frontend servers.
2.  Access `http://localhost:3000` in your browser.
3.  Explore charts, top volume, news. Register/Login to use the Favorites feature.

*(For detailed structure, full dependency list, and advanced configuration, refer to the previous detailed README or explore the codebase.)*

