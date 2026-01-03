import React from 'react';
import { motion } from 'motion/react';
import { X, Trophy, Award, User, ArrowLeft } from 'lucide-react';
import './Leaderboard.css';

interface LeaderboardProps {
  isOpen: boolean;
  onClose: () => void;
  leaderboardData: any[];
  currentUser: any;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ isOpen, onClose, leaderboardData, currentUser }) => {
  if (!isOpen) return null;

  const topThree = leaderboardData.slice(0, 3);
  const restOfLeaderboard = leaderboardData.slice(3);



  return (
    <div className="leaderboard-backdrop" onClick={onClose}>
      <motion.div
        className="leaderboard-modal"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="leaderboard-header">
          <button onClick={onClose} className="leaderboard-close-button">
            <ArrowLeft className="w-6 h-6" />
            <span className="ml-2 font-semibold">Back</span>
          </button>
          <div className="leaderboard-title-container">
            <Trophy className="leaderboard-title-icon" />
            <h2 className="leaderboard-title">Leaderboard<span className="text-sm font-normal opacity-70"></span></h2>
          </div>
        </div>

        <div className="leaderboard-content">
          <div className="leaderboard-top-three">
            {topThree.map((user, index) => (
              <div key={user.id} className={`leaderboard-top-user rank-${index + 1}`}>
                <div className="leaderboard-user-avatar">
                  <User />
                </div>
                <div className="leaderboard-user-rank-icon">
                  {index === 0 && '🥇'}
                  {index === 1 && '🥈'}
                  {index === 2 && '🥉'}
                </div>
                <div className="leaderboard-user-info">
                  <span className="leaderboard-user-name">{user.username}</span>
                  <span className="leaderboard-user-xp">{user.xp} XP</span>
                </div>
              </div>
            ))}
          </div>

          <div className="leaderboard-list">
            {restOfLeaderboard.length === 0 ? (
              <div className="text-center text-gray-500 py-4 italic">
                No other users on the leaderboard yet.
              </div>
            ) : (
              restOfLeaderboard.map((user, index) => (
                <div key={user.id} className={`leaderboard-list-item ${currentUser?.id === user.id ? 'current-user' : ''}`}>
                  <div className="leaderboard-list-item-rank">#{index + 4}</div>
                  <div className="leaderboard-list-item-user">
                    <div className="leaderboard-user-avatar small">
                      <User />
                    </div>
                    <span className="leaderboard-user-name">{user.username}</span>
                  </div>
                  <div className="leaderboard-list-item-xp">{user.xp} XP</div>
                </div>
              ))
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Leaderboard;
