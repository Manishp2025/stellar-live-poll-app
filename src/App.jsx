import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet,
  BarChart3,
  CheckCircle2,
  Loader2,
  RefreshCcw,
  ExternalLink,
  ChevronRight,
  Zap,
  LogOut,
} from 'lucide-react';
import { stellarService } from './services/stellarService';
import { cacheService } from './services/cacheService';
import { calculatePercentage, formatAddress } from './utils/pollUtils';

const STEPS = ['SIGNING', 'SUBMITTING', 'CONFIRMED'];

// ─── Skeleton Loader ─────────────────────────────────────────────────────────
function PollSkeleton() {
  return (
    <div className="glass p-8 md:p-12 space-y-6 animate-pulse">
      <div className="h-8 bg-white/10 rounded-xl w-3/4" />
      <div className="h-4 bg-white/5 rounded-xl w-1/4" />
      <div className="space-y-4 pt-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-20 bg-white/5 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

// ─── Transaction Progress Overlay ───────────────────────────────────────────
function TxOverlay({ voteProgress, onClose }) {
  const currentIdx = STEPS.indexOf(voteProgress);
  const isConfirmed = voteProgress === 'CONFIRMED';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(10,10,26,0.85)', backdropFilter: 'blur(12px)' }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 30 }}
        className="glass p-10 max-w-md w-full text-center"
      >
        {/* Icon */}
        <div className="flex justify-center mb-8">
          {isConfirmed ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="w-24 h-24 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(34,197,94,0.15)' }}
            >
              <CheckCircle2 size={48} className="text-green-400" />
            </motion.div>
          ) : (
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(62,27,219,0.15)' }}
            >
              <Loader2 size={48} className="text-stellar-blue animate-spin" />
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold mb-3">
          {voteProgress === 'SIGNING' && 'Awaiting Signature…'}
          {voteProgress === 'SUBMITTING' && 'Broadcasting Vote…'}
          {voteProgress === 'CONFIRMED' && '🎉 Vote Confirmed!'}
        </h3>

        {/* Subtitle */}
        <p className="text-white/50 mb-8 leading-relaxed">
          {voteProgress === 'SIGNING' && 'Please approve the transaction in your wallet.'}
          {voteProgress === 'SUBMITTING' && 'Your vote is being recorded on the Stellar Testnet.'}
          {voteProgress === 'CONFIRMED' && 'Your vote is permanently recorded on-chain.'}
        </p>

        {/* Step Indicator */}
        <div className="flex justify-center items-center gap-3 mb-8">
          {STEPS.map((step, i) => {
            const done = i < currentIdx;
            const active = i === currentIdx;
            return (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={`w-3 h-3 rounded-full transition-all duration-500 ${
                      done
                        ? 'bg-green-400 scale-110'
                        : active
                        ? 'bg-stellar-blue scale-125 shadow-lg shadow-stellar-blue/50'
                        : 'bg-white/10'
                    }`}
                  />
                  <span className={`text-xs ${active ? 'text-white/80' : 'text-white/30'}`}>
                    {step.charAt(0) + step.slice(1).toLowerCase()}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-px w-12 transition-colors duration-500 ${done ? 'bg-green-400' : 'bg-white/10'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {isConfirmed && (
          <button onClick={onClose} className="btn-primary w-full">
            Close & See Results
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── Main App ────────────────────────────────────────────────────────────────
function App() {
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [voteProgress, setVoteProgress] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [votedOption, setVotedOption] = useState(null);
  const [txHash, setTxHash] = useState(null);
  const [fromCache, setFromCache] = useState(false);

  // ── Fetch poll data (with caching) ─────────────────────────────────────
  const fetchPoll = async (bypassCache = false) => {
    setLoading(true);
    setFromCache(false);

    if (!bypassCache) {
      const cached = cacheService.get('poll_data');
      if (cached) {
        setPoll(cached);
        setLoading(false);
        setFromCache(true);
        return;
      }
    }

    try {
      const data = await stellarService.getPollResults();
      setPoll(data);
      cacheService.set('poll_data', data);
    } catch (err) {
      console.error('Failed to fetch poll:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPoll();
  }, []);

  // ── Connect wallet ──────────────────────────────────────────────────────
  const handleConnect = async () => {
    if (wallet) { setWallet(null); return; }
    const w = await stellarService.connectWallet();
    setWallet(w);
  };

  // ── Cast vote ───────────────────────────────────────────────────────────
  const handleVote = async (index) => {
    if (!wallet) { alert('Please connect your wallet first!'); return; }
    if (votedOption !== null || voting) return;

    setVoting(true);
    try {
      const result = await stellarService.vote(index, (status) => {
        setVoteProgress(status);
      });
      setTxHash(result.hash);
      setVotedOption(index);

      // Update local state and cache
      const updated = {
        ...poll,
        votes: poll.votes.map((v, i) => (i === index ? v + 1 : v)),
      };
      setPoll(updated);
      cacheService.set('poll_data', updated);
    } catch (err) {
      console.error('Vote failed:', err);
      alert('Vote failed. Please try again.');
    }
  };

  const closeTxOverlay = () => {
    setVoting(false);
    setVoteProgress(null);
  };

  // ── Derived data ────────────────────────────────────────────────────────
  const totalVotes = poll ? poll.votes.reduce((a, b) => a + b, 0) : 0;
  const percentages = poll ? calculatePercentage(poll.votes, totalVotes) : [];

  return (
    <div className="min-h-screen font-sans">
      {/* ── Background Orbs ─────────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #3e1bdb, transparent)' }} />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #7b2ff7, transparent)' }} />
      </div>

      {/* ── Main Container ───────────────────────────────────────────────── */}
      <div className="relative z-10 max-w-2xl mx-auto px-4 py-10">

        {/* ── Header ───────────────────────────────────────────────────── */}
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #3e1bdb, #7b2ff7)' }}>
              <Zap size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold leading-none">StellarPoll</h1>
              <p className="text-xs text-white/40 mt-0.5">Powered by Soroban</p>
            </div>
          </div>

          <button
            id="connect-wallet-btn"
            onClick={handleConnect}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
              wallet
                ? 'border-white/10 bg-white/5 text-white hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400'
                : 'border-transparent text-white hover:scale-105'
            }`}
            style={!wallet ? { background: 'linear-gradient(135deg, #3e1bdb, #7b2ff7)' } : {}}
          >
            {wallet ? <LogOut size={16} /> : <Wallet size={16} />}
            {wallet ? wallet.displayAddress : 'Connect Wallet'}
          </button>
        </header>

        {/* ── Poll Card ────────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <PollSkeleton />
            </motion.div>
          ) : poll ? (
            <motion.div
              key="poll"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass p-8 md:p-10"
            >
              {/* Poll header */}
              <div className="flex justify-between items-start mb-8">
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-xs text-white/40 uppercase tracking-widest">Live Poll · Testnet</span>
                    {fromCache && (
                      <span className="text-xs text-stellar-purple/80 bg-stellar-purple/10 px-2 py-0.5 rounded-full">cached</span>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold leading-snug">{poll.question}</h2>
                </div>
                <button
                  id="refresh-btn"
                  onClick={() => fetchPoll(true)}
                  className="p-2 text-white/30 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                  title="Refresh results"
                >
                  <RefreshCcw size={18} />
                </button>
              </div>

              {/* Options */}
              <div className="space-y-4">
                {poll.options.map((option, index) => {
                  const pct = percentages[index] ?? 0;
                  const isVoted = votedOption === index;
                  const isDisabled = voting || votedOption !== null;

                  return (
                    <motion.button
                      key={index}
                      id={`vote-option-${index}`}
                      disabled={isDisabled}
                      onClick={() => handleVote(index)}
                      className={`group relative w-full text-left p-5 rounded-2xl border transition-all duration-300 overflow-hidden ${
                        isVoted
                          ? 'border-stellar-purple/50'
                          : isDisabled
                          ? 'border-white/5 opacity-60 cursor-default'
                          : 'border-white/10 hover:border-white/25 hover:bg-white/5 cursor-pointer'
                      }`}
                      whileHover={!isDisabled ? { scale: 1.01 } : {}}
                      whileTap={!isDisabled ? { scale: 0.99 } : {}}
                    >
                      {/* Progress fill bar */}
                      <motion.div
                        className="absolute inset-0"
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        style={{
                          background: isVoted
                            ? 'linear-gradient(90deg, rgba(123,47,247,0.2), rgba(62,27,219,0.1))'
                            : 'rgba(255,255,255,0.03)',
                        }}
                      />

                      {/* Content */}
                      <div className="relative z-10 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          {isVoted && <CheckCircle2 size={18} className="text-stellar-purple flex-shrink-0" />}
                          <span className={`font-medium ${isVoted ? 'text-white' : 'text-white/80'}`}>{option}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-mono text-white/50">{poll.votes[index]} votes</span>
                          <span className={`text-sm font-bold ${isVoted ? 'text-stellar-purple' : 'text-white/40'}`}>
                            {pct}%
                          </span>
                          {!isDisabled && (
                            <ChevronRight size={16} className="text-white/20 group-hover:text-white/50 transition-colors" />
                          )}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center text-sm text-white/30">
                <span>{totalVotes.toLocaleString()} total votes</span>
                {txHash && (
                  <a
                    href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-stellar-purple/70 hover:text-stellar-purple transition-colors"
                  >
                    <ExternalLink size={14} />
                    View Tx
                  </a>
                )}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* ── Prompt to connect ──────────────────────────────────────────── */}
        {!wallet && !loading && poll && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-white/30 text-sm mt-6"
          >
            Connect your Stellar wallet to cast a vote
          </motion.p>
        )}
      </div>

      {/* ── Transaction Overlay ───────────────────────────────────────────── */}
      <AnimatePresence>
        {voting && (
          <TxOverlay voteProgress={voteProgress} onClose={closeTxOverlay} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
