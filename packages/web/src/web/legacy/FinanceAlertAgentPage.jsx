import React, { useState, useEffect } from 'react';
import { AlertCircle, DollarSign, Zap, TrendingUp, Send } from 'lucide-react';

export default function FinanceAlertAgentPage() {
  const [alerts, setAlerts] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [newAllocation, setNewAllocation] = useState({
    category: 'operations',
    amount: '',
    description: '',
  });
  const [accountAgentMessages, setAccountAgentMessages] = useState([]);

  useEffect(() => {
    // Simulate incoming subscription revenue
    const mockAlert = {
      id: Date.now(),
      type: 'subscription_received',
      amount: 34.99,
      plan: 'Pro',
      timestamp: new Date().toLocaleTimeString(),
    };
    setAlerts([mockAlert]);
  }, []);

  const handleAllocate = () => {
    if (!newAllocation.amount || !newAllocation.description) return;

    const allocation = {
      id: Date.now(),
      ...newAllocation,
      timestamp: new Date().toLocaleTimeString(),
    };

    setAllocations([allocation, ...allocations]);

    // Auto-alert account agent
    const message = {
      id: Date.now(),
      from: 'Finance Alert Agent',
      content: `Allocation: $${newAllocation.amount} to ${newAllocation.category} — ${newAllocation.description}`,
      timestamp: new Date().toLocaleTimeString(),
      status: 'sent',
    };
    setAccountAgentMessages([message, ...accountAgentMessages]);

    setNewAllocation({ category: 'operations', amount: '', description: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Zap className="w-8 h-8 text-amber-400" />
            Finance Alert Agent
          </h1>
          <p className="text-slate-400">
            Autonomous fund allocation & account agent notifications
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Incoming Revenue */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-400" />
                Incoming Subscription Revenue
              </h2>
              <div className="space-y-3">
                {alerts.length > 0 ? (
                  alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="bg-slate-700 rounded p-4 border-l-4 border-green-400"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-green-300">
                            {alert.plan} Plan Subscription
                          </p>
                          <p className="text-sm text-slate-300 mt-1">
                            Received: ${alert.amount.toFixed(2)}
                          </p>
                        </div>
                        <span className="text-xs text-slate-400">
                          {alert.timestamp}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400">Waiting for subscriptions...</p>
                )}
              </div>
            </div>

            {/* Fund Allocation */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                Allocate Funds
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Category
                  </label>
                  <select
                    value={newAllocation.category}
                    onChange={(e) =>
                      setNewAllocation({
                        ...newAllocation,
                        category: e.target.value,
                      })
                    }
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-400"
                  >
                    <option value="operations">Daily Operations</option>
                    <option value="maintenance">Maintenance & Upkeep</option>
                    <option value="infrastructure">Infrastructure</option>
                    <option value="reserves">Reserves</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Amount ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newAllocation.amount}
                    onChange={(e) =>
                      setNewAllocation({
                        ...newAllocation,
                        amount: e.target.value,
                      })
                    }
                    placeholder="0.00"
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={newAllocation.description}
                    onChange={(e) =>
                      setNewAllocation({
                        ...newAllocation,
                        description: e.target.value,
                      })
                    }
                    placeholder="e.g., Server costs, Fleet maintenance"
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-400"
                  />
                </div>

                <button
                  onClick={handleAllocate}
                  className="w-full bg-blue-600 hover:bg-blue-700 rounded px-4 py-2 font-semibold transition"
                >
                  Allocate & Alert Account Agent
                </button>
              </div>
            </div>
          </div>

          {/* Alert Log */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 h-fit">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              Allocations Log
            </h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {allocations.length > 0 ? (
                allocations.map((alloc) => (
                  <div
                    key={alloc.id}
                    className="bg-slate-700 rounded p-3 text-sm border-l-4 border-amber-400"
                  >
                    <p className="font-semibold text-amber-300">
                      ${alloc.amount}
                    </p>
                    <p className="text-slate-400 capitalize">{alloc.category}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {alloc.description}
                    </p>
                    <p className="text-xs text-slate-600 mt-1">{alloc.timestamp}</p>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-sm">
                  No allocations yet
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Account Agent Message Relay */}
        <div className="mt-6 bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Send className="w-5 h-5 text-purple-400" />
            Account Agent Notifications
          </h2>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {accountAgentMessages.length > 0 ? (
              accountAgentMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="bg-slate-700 rounded p-4 border-l-4 border-purple-400"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-semibold text-purple-300">
                        {msg.from}
                      </p>
                      <p className="text-slate-300 mt-1">{msg.content}</p>
                    </div>
                    <span className="text-xs text-slate-500">{msg.timestamp}</span>
                  </div>
                  <p className="text-xs text-green-400 mt-2">✓ {msg.status}</p>
                </div>
              ))
            ) : (
              <p className="text-slate-400">Awaiting notifications...</p>
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-900/30 border border-blue-700 rounded-lg p-4">
          <p className="text-sm text-blue-200">
            <strong>How it works:</strong> This agent has no access to banking data or account details — only message relay. It monitors subscription revenue, allocates funds to operations and maintenance categories, and immediately sends alerts to the account agent with allocation details.
          </p>
        </div>
      </div>
    </div>
  );
}
