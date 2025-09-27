'use client'

import { useState } from 'react'
import { usePublicElections } from '@/hooks/api/use-elections'
import { usePublicVotingResults } from '@/hooks/api/use-voting'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { 
  BarChart3, 
  PieChart as PieChartIcon,
  Trophy,
  Users,
  Vote,
  Calendar,
  CheckCircle,
  Clock
} from 'lucide-react'
import { ElectionStatus } from '@/types'
import { formatNumber, formatDateTime } from '@/lib/utils'

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316']

export default function ResultsPage() {
  const [selectedElection, setSelectedElection] = useState<number | null>(null)
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar')

  // Fetch public elections (completed and active)
  const { data: elections, isLoading: electionsLoading } = usePublicElections({
    limit: 20,
    sortBy: 'endDate',
    sortOrder: 'desc'
  })

  // Fetch results for selected election
  const { data: results, isLoading: resultsLoading } = usePublicVotingResults(
    selectedElection || 0,
    !!selectedElection
  )

  // Filter elections that have results (completed or active)
  const electionsWithResults = elections?.data.filter(election => 
    election.status === ElectionStatus.COMPLETED || election.status === ElectionStatus.ACTIVE
  ) || []

  const selectedElectionData = elections?.data.find(e => e.id === selectedElection)

  // Prepare chart data
  const chartData = results?.results.map((result, index) => ({
    name: result.candidate.name,
    votes: result.voteCount,
    percentage: result.percentage,
    color: COLORS[index % COLORS.length]
  })) || []

  const getStatusIcon = (status: ElectionStatus) => {
    switch (status) {
      case ElectionStatus.ACTIVE:
        return <Clock className="w-4 h-4 text-green-500" />
      case ElectionStatus.COMPLETED:
        return <CheckCircle className="w-4 h-4 text-blue-500" />
      default:
        return <Vote className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: ElectionStatus) => {
    switch (status) {
      case ElectionStatus.ACTIVE:
        return 'election-status-active'
      case ElectionStatus.COMPLETED:
        return 'election-status-completed'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const winner = results?.results[0]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
            <BarChart3 className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Election Results
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View transparent and real-time election results
          </p>
        </div>

        {!selectedElection ? (
          /* Election Selection */
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              Select an Election to View Results
            </h2>
            
            {electionsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="text-gray-600 dark:text-gray-400 mt-4">Loading elections...</p>
              </div>
            ) : electionsWithResults.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No Results Available
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    There are currently no election results available to view.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {electionsWithResults.map((election) => (
                  <Card key={election.id} className="election-card cursor-pointer hover:shadow-xl transition-all">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="truncate">{election.title}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(election.status)}`}>
                          {election.status.toLowerCase()}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                        {election.description}
                      </p>
                      
                      <div className="space-y-2 mb-6">
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>Ended: {formatDateTime(election.endDate)}</span>
                        </div>
                        {election._count && (
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <Users className="w-4 h-4 mr-2" />
                            <span>{election._count.candidates} candidates</span>
                          </div>
                        )}
                        {election._count && (
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <Vote className="w-4 h-4 mr-2" />
                            <span>{formatNumber(election._count.votes)} votes</span>
                          </div>
                        )}
                      </div>
                      
                      <Button 
                        onClick={() => setSelectedElection(election.id)}
                        className="w-full"
                      >
                        <BarChart3 className="w-4 h-4 mr-2" />
                        View Results
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Results Display */
          <div>
            {/* Back Button and Election Info */}
            <div className="flex items-center justify-between mb-6">
              <Button 
                variant="outline" 
                onClick={() => setSelectedElection(null)}
              >
                ← Back to Elections
              </Button>
              <div className="text-right">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedElectionData?.title}
                </h2>
                <div className="flex items-center justify-end space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  {getStatusIcon(selectedElectionData?.status || ElectionStatus.DRAFT)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedElectionData?.status || ElectionStatus.DRAFT)}`}>
                    {selectedElectionData?.status.toLowerCase()}
                  </span>
                </div>
              </div>
            </div>

            {resultsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="text-gray-600 dark:text-gray-400 mt-4">Loading results...</p>
              </div>
            ) : results ? (
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Total Votes</p>
                          <p className="text-2xl font-bold">{formatNumber(results.totalVotes)}</p>
                        </div>
                        <Vote className="w-8 h-8 text-blue-500" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Valid Votes</p>
                          <p className="text-2xl font-bold">{formatNumber(results.totalValidVotes)}</p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Invalid Votes</p>
                          <p className="text-2xl font-bold">{formatNumber(results.totalInvalidVotes)}</p>
                        </div>
                        <Users className="w-8 h-8 text-red-500" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  {winner && (
                    <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-yellow-700 dark:text-yellow-400">Winner</p>
                            <p className="text-lg font-bold text-yellow-800 dark:text-yellow-300 truncate">
                              {winner.candidate.name}
                            </p>
                          </div>
                          <Trophy className="w-8 h-8 text-yellow-500" />
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Chart Controls */}
                <div className="flex justify-center space-x-2">
                  <Button
                    variant={chartType === 'bar' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setChartType('bar')}
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Bar Chart
                  </Button>
                  <Button
                    variant={chartType === 'pie' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setChartType('pie')}
                  >
                    <PieChartIcon className="w-4 h-4 mr-2" />
                    Pie Chart
                  </Button>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Chart Visualization */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Vote Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          {chartType === 'bar' ? (
                            <BarChart data={chartData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis 
                                dataKey="name" 
                                angle={-45}
                                textAnchor="end"
                                height={80}
                              />
                              <YAxis />
                              <Tooltip 
                                formatter={(value, name) => [
                                  `${formatNumber(value as number)} votes`,
                                  'Votes'
                                ]}
                              />
                              <Bar dataKey="votes" fill="#3B82F6" />
                            </BarChart>
                          ) : (
                            <PieChart>
                              <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percentage }) => `${name}: ${(percentage as number).toFixed(1)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="votes"
                              >
                                {chartData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip 
                                formatter={(value) => [`${formatNumber(value as number)} votes`, 'Votes']}
                              />
                            </PieChart>
                          )}
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Detailed Results */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Detailed Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {results.results.map((result, index) => (
                          <div key={result.candidate.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-full text-primary-foreground font-bold text-sm">
                                {index + 1}
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">
                                  {result.candidate.name}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {formatNumber(result.voteCount)} votes ({result.percentage.toFixed(1)}%)
                                </p>
                              </div>
                            </div>
                            {index === 0 && (
                              <Trophy className="w-5 h-5 text-yellow-500" />
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No Results Available
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Results for this election are not yet available.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
