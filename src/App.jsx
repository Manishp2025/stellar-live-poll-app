import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, 
  BarChart3, 
  CheckCircle2, 
  Loader2, 
  RefreshCcw, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { stellarService } from './services/stellarService';
import { cacheService } from './services/cacheService';

function App() {
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [voteProgress, setVoteProgress] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [votedOption, setVotedOption] = useState(null);

  const fetchPoll = async (useCache = true) => {
    setLoading(true);
    if (useCache) {
      const cached = cacheService.get('poll_data');
      if (cached) {
        setPoll(cached);
        setLoading(false);
        return;
      }
    }

    try {
      const data = await stellarService.getPollResults();
      setPoll(data);
      cacheService.set('poll_data', data);
    } catch (error) {
      console.error("Failed to fetch poll:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPoll();
  }, []);

  const handleVote = async (index) => {
    if (!wallet) {
      alert("Please connect your wallet first!");
      return;
    }
    
    setVoting(true);
    try {
      await stellarService.vote(index, (status) => {
        setVoteProgress(status);
      });
      setVotedOption(index);
      // Update poll locally
      const newPoll = { ...poll };
      newPoll.votes[index] += 1;
      setPoll(newPoll);
      cacheService.set('poll_data', newPoll);
    } catch (error) {
      console.error("Vote failed:", error);
    } finally {
      setTimeout(() => {
        setVoting(false);
        setVoteProgress(null);
      }, 2000);
    }
  };

  const connectWallet = async () => {
    setWallet("G...ASDF"); // Mock connection
  };

  const totalVotes = poll ? poll.votes.reduce((a, b) => a + b, 0) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <header className="flex justify-between items-center mb-16">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-stellar-blue rounded-xl flex items-center justify-center">
            <BarChart3 className="text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">StellarPoll <span className="text-stellar-purple">L3</span></h1>
        </div>
        
        <button 
          onClick={connectWallet}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
            wallet ? 'bg-white/10 text-white border border-white/20' : 'bg-white text-stellar-dark hover:bg-white/90'
          }`}
        >
          <Wallet size={18} />
          {wallet ? `${wallet.slice(0, 4)}...${wallet.slice(-4)}` : 'Connect Wallet'}
        </button>
      </header>

      <main>
        {loading ? (
          <div className="space-y-6">
            <div className="h-12 w-3/4 bg-white/5 animate-pulse rounded-xl" />
            <div className="grid gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-16 bg-white/5 animate-pulse rounded-xl" />
              ))}
            </div>
          </div>
        ) : poll ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-8 md:p-12 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4">
              <button 
                onClick={() => fetchPoll(false)}
                className="p-2 text-white/40 hover:text-white transition-colors"
                title="Refresh results"
              >
                <RefreshCcw size={20} />
              </button>
            </div>

            <h2 className="text-3xl font-bold mb-8 leading-tight">{poll.question}</h2>

            <div className="grid gap-6">
              {poll.options.map((option, index) => {
                const percentage = totalVotes > 0 ? Math.round((poll.votes[index] / totalVotes) * 100) : 0;
                const isVoted = votedOption === index;

                return (
                  <button
                    key={index}
                    disabled={voting || votedOption !== null}
                    onClick={() => handleVote(index)}
                    className={`group relative w-full text-left p-6 rounded-2xl transition-all border ${
                      isVoted 
                        ? 'border-stellar-purple bg-stellar-purple/10' 
                        : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="relative z-10 flex justify-between items-center">
                      <span className="text-lg font-medium">{option}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-white/60 font-mono">{percentage}%</span>
                        {isVoted && <CheckCircle2 className="text-stellar-purple" size={20} />}
                        {!isVoted && votedOption === null && <ChevronRight className="text-white/20 group-hover:text-white/50" size={20} />}
                      </div>
                    </div>
                    
                    {/* Progress Bar Background */}
                    <div className="absolute inset-0 z-0 overflow-hidden rounded-2xl">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        className={`h-full ${isVoted ? 'bg-stellar-purple/20' : 'bg-white/5'}`}
                      />
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-12 flex justify-between items-center text-sm text-white/40">
              <span>Total Votes: {totalVotes}</span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Live on Testnet
              </div>
            </div>
          </motion.div>
        ) : null}
      </main>

      {/* Transaction Overlay */}
      <AnimatePresence>
        {voting && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-stellar-dark/80 backdrop-blur-sm px-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="glass p-10 max-w-md w-full text-center"
            >
              <div className="mb-8 flex justify-center">
                {voteProgress === 'CONFIRMED' ? (
                  <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="text-green-500" size={40} />
                  </div>
                ) : (
                  <Loader2 className="text-stellar-blue animate-spin" size={60} />
                )}
              </div>

              <h3 className="text-2xl font-bold mb-4">
                {voteProgress === 'SIGNING' && 'Signing Transaction...'}
                {voteProgress === 'SUBMITTING' && 'Broadcasting to Stellar...'}
                {voteProgress === 'CONFIRMED' && 'Vote Confirmed!'}
              </h3>
              
              <p className="text-white/60 mb-8">
                {voteProgress === 'SIGNING' && 'Please confirm the request in your wallet.'}
                {voteProgress === 'SUBMITTING' && 'The network is processing your vote.'}
                {voteProgress === 'CONFIRMED' && 'Your vote has been recorded on the blockchain.'}
              </p>

              {voteProgress === 'CONFIRMED' && (
                <button 
                  onClick={() => setVoting(false)}
                  className="btn-primary w-full"
                >
                  Close
                </button>
              )}

              <div className="mt-8 pt-8 border-t border-white/10 flex justify-center gap-6">
                {['SIGNING', 'SUBMITTING', 'CONFIRMED'].map((step, i) => {
                  const currentIdx = ['SIGNING', 'SUBMITTING', 'CONFIRMED'].indexOf(voteProgress);
                  const isDone = i < currentIdx;
                  const isCurrent = i === currentIdx;

                  return (
                    <div key={step} className="flex flex-col items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        isDone ? 'bg-green-500' : isCurrent ? 'bg-stellar-blue animate-pulse' : 'bg-white/10'
                      }`} />
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
