'use client'

import { useState, useEffect } from 'react'
import { usePublicElections } from '@/hooks/api/use-elections'
import { usePublicCandidates } from '@/hooks/api/use-candidates'
import { useCastVote, useVerifyVoter } from '@/hooks/api/use-voting'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Vote, 
  CheckCircle, 
  Clock, 
  Users,
  Calendar,
  AlertCircle,
  User,
  Shield
} from 'lucide-react'
import { ElectionStatus, Candidate } from '@/types'
import { formatDate, formatDateTime } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

export default function VotePage() {
  const [selectedElection, setSelectedElection] = useState<number | null>(null)
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null)
  const [voterIdentifier, setVoterIdentifier] = useState('')
  const [isVerified, setIsVerified] = useState(false)
  const [step, setStep] = useState<'elections' | 'verification' | 'voting' | 'confirmation'>('elections')
  
  const { toast } = useToast()

  // Fetch active public elections
  const { data: elections, isLoading: electionsLoading } = usePublicElections({
    limit: 20,
    sortBy: 'startDate',
    sortOrder: 'asc'
  })

  // Fetch candidates for selected election
  const { data: candidates, isLoading: candidatesLoading } = usePublicCandidates(
    selectedElection || 0,
    { sortBy: 'position', sortOrder: 'asc' },
    !!selectedElection
  )

  const verifyVoterMutation = useVerifyVoter()
  const castVoteMutation = useCastVote()

  // Filter active elections
  const activeElections = elections?.data.filter(election => 
    election.status === ElectionStatus.ACTIVE
  ) || []

  const handleElectionSelect = (electionId: number) => {
    setSelectedElection(electionId)
    setStep('verification')
  }

  const handleVerifyVoter = async () => {
    if (!selectedElection || !voterIdentifier.trim()) {
      toast({
        title: 'Verification required',
        description: 'Please enter your voter identifier.',
        variant: 'destructive',
      })
      return
    }

    try {
      const result = await verifyVoterMutation.mutateAsync({
        electionId: selectedElection,
        voterIdentifier: voterIdentifier.trim(),
      })

      if (!result.isEligible) {
        toast({
          title: 'Not eligible',
          description: 'You are not eligible to vote in this election.',
          variant: 'destructive',
        })
        return
      }

      if (result.hasVoted) {
        toast({
          title: 'Already voted',
          description: 'You have already cast your vote in this election.',
          variant: 'destructive',
        })
        return
      }

      setIsVerified(true)
      setStep('voting')
      toast({
        title: 'Verification successful',
        description: 'You are eligible to vote. Please select your candidate.',
      })
    } catch (error) {
      // Error handled by the hook
    }
  }

  const handleCastVote = async () => {
    if (!selectedElection || !selectedCandidate) {
      toast({
        title: 'Selection required',
        description: 'Please select a candidate to vote for.',
        variant: 'destructive',
      })
      return
    }

    try {
      await castVoteMutation.mutateAsync({
        electionId: selectedElection,
        candidateId: selectedCandidate,
        voterIdentifier: voterIdentifier.trim(),
      })

      setStep('confirmation')
    } catch (error) {
      // Error handled by the hook
    }
  }

  const resetVoting = () => {
    setSelectedElection(null)
    setSelectedCandidate(null)
    setVoterIdentifier('')
    setIsVerified(false)
    setStep('elections')
  }

  const selectedElectionData = elections?.data.find(e => e.id === selectedElection)
  const selectedCandidateData = candidates?.data.find(c => c.id === selectedCandidate)

  if (step === 'confirmation') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Vote Cast Successfully!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your vote for <strong>{selectedCandidateData?.name}</strong> in{' '}
              <strong>{selectedElectionData?.title}</strong> has been recorded securely.
            </p>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <Shield className="w-4 h-4 inline mr-2" />
                Your vote is anonymous and cannot be traced back to you.
              </p>
            </div>
            <Button onClick={resetVoting} className="w-full">
              Vote in Another Election
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
            <Vote className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Electa Voting System
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Secure, transparent, and democratic elections
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 ${step === 'elections' ? 'text-primary' : step === 'verification' || step === 'voting' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'elections' ? 'bg-primary text-white' : step === 'verification' || step === 'voting' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                1
              </div>
              <span className="text-sm font-medium">Select Election</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className={`flex items-center space-x-2 ${step === 'verification' ? 'text-primary' : step === 'voting' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'verification' ? 'bg-primary text-white' : step === 'voting' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                2
              </div>
              <span className="text-sm font-medium">Verify Identity</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className={`flex items-center space-x-2 ${step === 'voting' ? 'text-primary' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'voting' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'}`}>
                3
              </div>
              <span className="text-sm font-medium">Cast Vote</span>
            </div>
          </div>
        </div>

        {/* Step 1: Select Election */}
        {step === 'elections' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              Select an Active Election
            </h2>
            
            {electionsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="text-gray-600 dark:text-gray-400 mt-4">Loading elections...</p>
              </div>
            ) : activeElections.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No Active Elections
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    There are currently no active elections available for voting.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeElections.map((election) => (
                  <Card key={election.id} className="election-card cursor-pointer hover:shadow-xl transition-all">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{election.title}</span>
                        <span className="election-status-active px-2 py-1 rounded-full text-xs">
                          Active
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {election.description}
                      </p>
                      
                      <div className="space-y-2 mb-6">
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>Started: {formatDateTime(election.startDate)}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Clock className="w-4 h-4 mr-2" />
                          <span>Ends: {formatDateTime(election.endDate)}</span>
                        </div>
                        {election._count && (
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <Users className="w-4 h-4 mr-2" />
                            <span>{election._count.candidates} candidates</span>
                          </div>
                        )}
                      </div>
                      
                      <Button 
                        onClick={() => handleElectionSelect(election.id)}
                        className="w-full vote-button"
                      >
                        <Vote className="w-4 h-4 mr-2" />
                        Vote in This Election
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Voter Verification */}
        {step === 'verification' && selectedElectionData && (
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Voter Verification</CardTitle>
                <p className="text-center text-gray-600 dark:text-gray-400">
                  Election: <strong>{selectedElectionData.title}</strong>
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="voterIdentifier">Voter Identifier</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="voterIdentifier"
                      type="text"
                      placeholder="Enter your voter ID or identifier"
                      value={voterIdentifier}
                      onChange={(e) => setVoterIdentifier(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    This could be your national ID, voter registration number, or email address.
                  </p>
                </div>

                <div className="flex space-x-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setStep('elections')}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={handleVerifyVoter}
                    disabled={!voterIdentifier.trim() || verifyVoterMutation.isPending}
                    className="flex-1"
                  >
                    {verifyVoterMutation.isPending ? 'Verifying...' : 'Verify & Continue'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Voting */}
        {step === 'voting' && selectedElectionData && (
          <div>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Cast Your Vote
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Election: <strong>{selectedElectionData.title}</strong>
              </p>
            </div>

            {candidatesLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="text-gray-600 dark:text-gray-400 mt-4">Loading candidates...</p>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  {candidates?.data.map((candidate) => (
                    <div
                      key={candidate.id}
                      onClick={() => setSelectedCandidate(candidate.id)}
                      className={`candidate-card ${selectedCandidate === candidate.id ? 'selected' : ''}`}
                    >
                      {candidate.imageUrl && (
                        <img
                          src={candidate.imageUrl}
                          alt={candidate.name}
                          className="w-16 h-16 rounded-full mx-auto mb-3 object-cover"
                        />
                      )}
                      <h3 className="font-semibold text-center mb-2">{candidate.name}</h3>
                      {candidate.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                          {candidate.description}
                        </p>
                      )}
                      {selectedCandidate === candidate.id && (
                        <div className="flex items-center justify-center mt-3">
                          <CheckCircle className="w-5 h-5 text-primary" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="max-w-md mx-auto">
                  <div className="flex space-x-3">
                    <Button 
                      variant="outline" 
                      onClick={() => setStep('verification')}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button 
                      onClick={handleCastVote}
                      disabled={!selectedCandidate || castVoteMutation.isPending}
                      className="flex-1 vote-button"
                    >
                      {castVoteMutation.isPending ? 'Casting Vote...' : 'Cast Vote'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
