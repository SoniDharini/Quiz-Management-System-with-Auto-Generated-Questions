import React, { useEffect, useState } from 'react';
import { userAPI } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

// Define data types
interface OverallPerformance {
  average_score: number;
  highest_score: number;
}

interface CategoryDistribution {
  category: string;
  quiz_count: number;
}

interface PerformanceByCategory {
  category: string;
  average_score: number;
  highest_score: number;
}

interface UserProgress {
  quiz_name: string;
  score: number;
  date: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1919'];

const PerformanceDashboard: React.FC = () => {
  const [overallPerformance, setOverallPerformance] = useState<OverallPerformance | null>(null);
  const [categoryDistribution, setCategoryDistribution] = useState<CategoryDistribution[]>([]);
  const [performanceByCategory, setPerformanceByCategory] = useState<PerformanceByCategory[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [
          overallPerf,
          catDist,
          perfByCat,
          userProg
        ] = await Promise.all([
          userAPI.getOverallPerformance(),
          userAPI.getCategoryDistribution(),
          userAPI.getPerformanceByCategory(),
          userAPI.getUserProgress()
        ]);
        setOverallPerformance(overallPerf);
        setCategoryDistribution(catDist);
        setPerformanceByCategory(perfByCat);
        setUserProgress(userProg);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch performance data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading performance data...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-4 md:p-6 bg-gray-50 dark:bg-gray-900 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Performance Dashboard</h2>
      
      {/* Overall Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center">
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300">Overall Average Score</h3>
          <p className="text-4xl font-bold text-blue-500 mt-2">{overallPerformance?.average_score.toFixed(1)}%</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center">
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300">Overall Highest Score</h3>
          <p className="text-4xl font-bold text-green-500 mt-2">{overallPerformance?.highest_score.toFixed(1)}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Overall Performance Pie Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Overall Performance by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryDistribution}
                dataKey="quiz_count"
                nameKey="category"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                fill="#8884d8"
                paddingAngle={5}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {categoryDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [`${value} quizzes`, name]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Performance by Category */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Performance by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceByCategory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" label={{ value: 'Average Score (%)', angle: -90, position: 'insideLeft' }}/>
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" label={{ value: 'Highest Score (%)', angle: -90, position: 'insideRight' }}/>
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="average_score" fill="#8884d8" name="Average Score" />
              <Bar yAxisId="right" dataKey="highest_score" fill="#82ca9d" name="Highest Score" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* User Progress Rate Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm col-span-1 xl:col-span-2">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Recent Quiz Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userProgress}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis label={{ value: 'Score (%)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="score" stroke="#8884d8" activeDot={{ r: 8 }} name="Quiz Score" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default PerformanceDashboard;
