import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import useRealtimeCoinPrice from '../hooks/useRealtimeCoinPrice';
import useRealtimeCandlestick from '../hooks/useRealtimeCandlestick';
import CoinSelector from './CoinSelector';
import { useAuth } from '../context/AuthContext'; // Import useAuth
import { useFavorites } from '../context/FavoriteContext'; // Import useFavorites

import {
  ChartCanvas,
  Chart as FinancialChart,
  XAxis as FinancialXAxis,
  YAxis as FinancialYAxis,
  CandlestickSeries,
  OHLCTooltip,
  CrossHairCursor,
} from 'react-financial-charts';
import { scaleTime } from 'd3-scale';

const INITIAL_DATA_POINTS = 1440; // 24 hours * 60 minutes
const MIN_DATA_POINTS = 60; // 1 hour
const MAX_DATA_POINTS = 1440; // 24 hours

const Chart = () => {
  // State Management
  const [selectedCoin, setSelectedCoin] = useState('BTC');
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataPoints, setDataPoints] = useState(INITIAL_DATA_POINTS);
  const [showCandlestick, setShowCandlestick] = useState(false);
  const [xExtents, setXExtents] = useState(null);
  const chartRef = useRef(null);

  // Custom Hooks
  const { priceData, loading: realtimeLoading, error: realtimeError } = useRealtimeCoinPrice(selectedCoin, 5000);
  const { candlestickData, loading: candleLoading, error: candleError } = useRealtimeCandlestick(selectedCoin);
  const [hoveredCandle, setHoveredCandle] = useState(null);

  // Auth and Favorites Context
  const { isAuthenticated } = useAuth();
  const { addFavorite, removeFavorite, isFavorite, loading: favLoading } = useFavorites();

  const calculateCandleWidth = useCallback((dataLength) => {
    if (dataLength <= 10) return 40;
    if (dataLength <= 30) return 20;
    if (dataLength <= 50) return 15;
    if (dataLength <= 100) return 10;
    return 5;
  }, []);

  // Fetch Historical Data
  useEffect(() => {
    const fetchHistoricalData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`http://localhost:4000/api/coin/history?symbol=${selectedCoin}`);
        setHistoricalData(response.data.history);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistoricalData();
  }, [selectedCoin]);

  // Update Historical Data with Real-time Price
  useEffect(() => {
    if (priceData) {
      setHistoricalData(prevData => {
        const isNewPriceExists = prevData.some(data => data.time === priceData.last_updated);
        if (!isNewPriceExists) {
          return [...prevData, { time: priceData.last_updated, price: priceData.price }];
        }
        return prevData;
      });
    }
  }, [priceData]);

  // Memoized Data Processing
  const lineChartData = useMemo(() => {
    return historicalData.slice(-dataPoints).map((item) => ({
      time: new Date(item.time).toISOString(),
      price: item.price,
    }));
  }, [historicalData, dataPoints]);

  // Calculate Y-Axis Domain
  const calculateYDomain = useCallback((data) => {
    if (!data || data.length === 0) return [0, 100];

    const prices = data.map(d => d.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    const buffer = (maxPrice - minPrice) * 0.1;
    return [minPrice - buffer, maxPrice + buffer];
  }, []);

  // Hàm tính toán vị trí tương đối của chuột trong chart
  const calculateRelativePosition = useCallback((event) => {
    if (!chartRef.current) return { x: 0, y: 0 };
    const chartBounds = chartRef.current.getBoundingClientRect();
    return {
      x: (event.clientX - chartBounds.left) / chartBounds.width,
      y: (event.clientY - chartBounds.top) / chartBounds.height // Không đảo ngược trục y
    };
  }, []);

  // Format Y-Axis Values
  const formatYAxis = useCallback((value) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(2)}K`;
    } else if (value >= 1) {
      return `$${value.toFixed(2)}`;
    } else if (value >= 0.01) {
      return `$${value.toFixed(4)}`;
    } else if (value >= 0.0001) {
      return `$${value.toFixed(6)}`;
    } else if (value >= 0.00000001) {
      return `$${value.toFixed(8)}`;
    } else {
      // Đối với giá trị cực kỳ nhỏ, sử dụng ký hiệu khoa học
      return `$${value.toExponential(6)}`;
    }
  }, []);

  // Cập nhật hàm handleWheel với logic zoom mới
  const handleWheel = useCallback((event) => {
    event.preventDefault();
    const zoomDirection = event.deltaY > 0 ? 1 : -1;
    const zoomFactor = 0.1;
    const { x: relativeX } = calculateRelativePosition(event);

    setDataPoints((prevPoints) => {
      const newPoints = Math.round(prevPoints * (1 + zoomDirection * zoomFactor));
      const clampedPoints = Math.max(MIN_DATA_POINTS, Math.min(MAX_DATA_POINTS, newPoints));

      if (showCandlestick && candlestickData.length > 0) {
        // Tính toán lại phạm vi thời gian dựa trên số điểm dữ liệu mới
        const visibleDataLength = Math.min(clampedPoints, candlestickData.length);
        const lastIndex = candlestickData.length - 1;
        const startIndex = Math.max(0, lastIndex - visibleDataLength + 1);

        const startTime = new Date(candlestickData[startIndex].time);
        const endTime = new Date(candlestickData[lastIndex].time);
        const timeRange = endTime.getTime() - startTime.getTime();

        // Thêm padding 10% ở cả hai bên
        const padding = timeRange * 0.1;
        setXExtents([
          new Date(startTime.getTime() - padding),
          new Date(endTime.getTime() + padding)
        ]);
      }

      return clampedPoints;
    });
  }, [candlestickData, showCandlestick, calculateRelativePosition]);

  // Handle Coin Selection
  const handleCoinChange = (newCoin) => {
    setSelectedCoin(newCoin);
    setXExtents(null);
  };

  // Handle Hover on Candlestick
  const handleCandlestickHover = useCallback((event) => {
    if (event.currentItem) {
      setHoveredCandle(event.currentItem);
    } else {
      setHoveredCandle(null);
    }
  }, []);

  // Handle Favorite Toggle
  const handleFavoriteToggle = () => {
    console.log('[DEBUG] handleFavoriteToggle called. isAuthenticated:', isAuthenticated, 'selectedCoin:', selectedCoin); // Log 1
    if (!isAuthenticated) {
      console.log('[DEBUG] Not authenticated, returning.'); // Log 2
      return;
    }
    console.log('[DEBUG] Is favorite?', isFavorite(selectedCoin)); // Log 3
    if (isFavorite(selectedCoin)) {
      console.log('[DEBUG] Calling removeFavorite...'); // Log 4
      removeFavorite(selectedCoin);
    } else {
      console.log('[DEBUG] Calling addFavorite...'); // Log 5
      addFavorite(selectedCoin);
    }
  };

  // Loading and Error States
  if (loading || realtimeLoading || (showCandlestick && candleLoading)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || realtimeError || (showCandlestick && candleError)) {
    return (
      <div className="text-xl text-red-500 text-center p-4">
        Error: {(error || realtimeError || candleError)?.message}
      </div>
    );
  }

  if (!historicalData.length) return null;

  // Log state before rendering button
  console.log('[DEBUG] Chart Render - isAuthenticated:', isAuthenticated, 'favLoading:', favLoading);

  // Render Chart Component
  return (
    <div className="p-4 w-full max-w-6xl mx-auto">
      {/* Header Section with Favorite Button */}
      <div className="mb-6 flex justify-between items-center">
        <CoinSelector
          selectedCoin={selectedCoin}
          onCoinChange={handleCoinChange}
        />
        <h2 className="text-3xl font-bold text-center flex-grow mx-4">{selectedCoin}/USD Chart</h2>
        {/* Favorite Button - Only show if logged in */}
        {isAuthenticated && (
          <button
            onClick={(e) => { console.log('[DEBUG] Star button clicked!'); handleFavoriteToggle(); }} // Inline log + call handler
            disabled={favLoading}
            className={`p-2 rounded-full transition-colors duration-200 ${favLoading ? 'opacity-50 cursor-not-allowed' : ''} ${isFavorite(selectedCoin) ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-400 hover:text-yellow-400'}`}
            title={isFavorite(selectedCoin) ? 'Remove from Favorites' : 'Add to Favorites'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={isFavorite(selectedCoin) ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.539 1.118l-3.975-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.539-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </button>
        )}
      </div>

      {/* Price Info Section */}
      <div className="mb-4 text-center bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-gray-600">Current Price</p>
            <p className="text-xl font-bold">{formatYAxis(priceData?.price || 0)}</p>
          </div>
          <div>
            <p className="text-gray-600">24h Change</p>
            <p className={`text-xl font-bold ${priceData?.percent_change_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {priceData?.percent_change_24h?.toFixed(2)}%
            </p>
          </div>
          <div>
            <p className="text-gray-600">Last Updated</p>
            <p className="text-sm">{new Date(priceData?.last_updated).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Chart Type Selector */}
      <div className="flex justify-center gap-2 mb-4">
        <button
          onClick={() => setShowCandlestick(false)}
          className={`p-2 rounded-lg transition-all duration-200 ${!showCandlestick
            ? 'bg-blue-500 text-white shadow-lg scale-105'
            : 'bg-gray-200 hover:bg-gray-300'
            }`}
          title="Line Chart"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16" />
          </svg>
        </button>
        <button
          onClick={() => setShowCandlestick(true)}
          className={`p-2 rounded-lg transition-all duration-200 ${showCandlestick
            ? 'bg-blue-500 text-white shadow-lg scale-105'
            : 'bg-gray-200 hover:bg-gray-300'
            }`}
          title="Candlestick Chart"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8m-8 4h8m-8 4h8M3 3v18h18" />
          </svg>
        </button>
      </div>

      {/* Chart Display */}
      <div ref={chartRef} className="w-full h-[500px] bg-white rounded-lg shadow-lg p-4" onWheel={handleWheel}>
        {showCandlestick && candlestickData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <ChartCanvas
              ratio={2}
              margin={{ left: 50, right: 50, top: 10, bottom: 30 }}
              seriesName={selectedCoin}
              data={candlestickData}
              xAccessor={(d) => d?.time ? new Date(d.time) : null}
              xScale={scaleTime()}
              xExtents={(() => {
                if (xExtents) return xExtents;

                if (!candlestickData || candlestickData.length < 2) {
                  const now = new Date();
                  return [
                    new Date(now.getTime() - 24 * 60 * 60 * 1000),
                    now
                  ];
                }

                const startTime = new Date(candlestickData[0].time);
                const endTime = new Date(candlestickData[candlestickData.length - 1].time);
                const timeRange = endTime.getTime() - startTime.getTime();
                const padding = timeRange * 0.1; // 10% padding

                return [
                  new Date(startTime.getTime() - padding),
                  new Date(endTime.getTime() + padding)
                ];
              })()}
              onMouseMove={handleCandlestickHover}
              displayXAccessor={(d) => d?.time ? new Date(d.time) : null}
            >
              <FinancialChart
                id={1}
                yExtents={(d) => {
                  if (!d || !d.high || !d.low) return [0, 100];
                  const range = d.high - d.low;
                  const padding = range * 0.2; // 20% padding
                  return [d.low - padding, d.high + padding];
                }}
              >
                <FinancialXAxis tickRotation={-45} />
                <FinancialYAxis tickFormatter={formatYAxis} />
                <CandlestickSeries
                  width={calculateCandleWidth(candlestickData.length)}
                />
                <OHLCTooltip
                  origin={[-40, 0]}
                  textFill={hoveredCandle && hoveredCandle.close > hoveredCandle.open ? "#06b6d4" : "#ef4444"}
                  ohlcFormat={value => formatYAxis(value)}
                  displayTexts={{
                    o: 'O: ',
                    h: 'H: ',
                    l: 'L: ',
                    c: 'C: ',
                    v: 'Vol: '
                  }}
                />
                <CrossHairCursor />
              </FinancialChart>
            </ChartCanvas>
          </ResponsiveContainer>
        ) : (
          // Line Chart
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={lineChartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="time"
                tickFormatter={(time) => new Date(time).toLocaleTimeString()}
                ticks={lineChartData.map((d) => d.time).filter((_, index) => index % Math.max(1, Math.floor(lineChartData.length / 10)) === 0)}
                tick={{ fill: 'black' }}
              />
              <YAxis
                domain={calculateYDomain(lineChartData)}
                tickFormatter={formatYAxis}
                tickCount={10}
              />
              <Tooltip
                labelFormatter={(label) => new Date(label).toLocaleString()}
                formatter={(value) => [formatYAxis(value), 'Price']}
                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#2563eb"
                dot={false}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
      {/* Zoom Instructions */}
      <div className="text-center text-gray-500 mt-2">
        Use mouse wheel to zoom in/out
      </div>
    </div>
  );
};

export default Chart;
