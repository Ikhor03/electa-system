'use client'

import { useState } from 'react'
import { useElections, useDeleteElection, useUpdateElectionStatus } from '@/hooks/api/use-elections'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  Vote, 
  Plus,
  Search,
  Calendar,
  Users,
  BarChart3,
  Edit,
  Trash2,
  Play,
  Pause,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye
} from 'lucide-react'
import Link from 'next/link'
import { ElectionStatus, Election } from '@/types'
import { formatDateTime, formatNumber } from '@/lib/utils'
import { useAuth } from '@/contexts/auth-context'
import { UserRole } from '@/types'

export default function ElectionsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<ElectionStatus | 'ALL'>('ALL')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedElection, setSelectedElection] = useState<Election | null>(null)

  const { user } = useAuth()
  
  const { data: elections, isLoading } = useElections({
    search: searchTerm,
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })

  const deleteElectionMutation = useDeleteElection()
  const updateStatusMutation = useUpdateElectionStatus()

  const getStatusIcon = (status: ElectionStatus) => {
    switch (status) {
      case ElectionStatus.ACTIVE:
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case ElectionStatus.UPCOMING:
        return <Clock className="w-4 h-4 text-yellow-500" />
      case ElectionStatus.COMPLETED:
        return <BarChart3 className="w-4 h-4 text-blue-500" />
      case ElectionStatus.DRAFT:
        return <AlertCircle className="w-4 h-4 text-gray-500" />
      case ElectionStatus.CANCELLED:
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: ElectionStatus) => {
    switch (status) {
      case ElectionStatus.ACTIVE:
        return 'election-status-active'
      case ElectionStatus.UPCOMING:
        return 'election-status-upcoming'
      case ElectionStatus.COMPLETED:
        return 'election-status-completed'
      case ElectionStatus.DRAFT:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      case ElectionStatus.CANCELLED:
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const canManageElection = (election: Election) => {
    if (user?.role === UserRole.SUPER_ADMIN) return true
    if (user?.role === UserRole.ADMIN) return true
    if (user?.role === UserRole.OPERATOR && election.createdBy === user.id) return true
    return false
  }

  const canDeleteElection = (election: Election) => {
    if (user?.role === UserRole.SUPER_ADMIN) return true
    if (user?.role === UserRole.ADMIN && election.status === ElectionStatus.DRAFT) return true
    return false
  }

  const handleStatusChange = async (election: Election, newStatus: ElectionStatus) => {
    try {
      await updateStatusMutation.mutateAsync({
        id: election.id,
        status: newStatus
      })
    } catch (error) {
      // Error handled by the hook
    }
  }

  const handleDeleteElection = async () => {
    if (!selectedElection) return
    
    try {
      await deleteElectionMutation.mutateAsync(selectedElection.id)
      setDeleteDialogOpen(false)
      setSelectedElection(null)
    } catch (error) {
      // Error handled by the hook
    }
  }

  const getAvailableStatusTransitions = (currentStatus: ElectionStatus) => {
    switch (currentStatus) {
      case ElectionStatus.DRAFT:
        return [ElectionStatus.UPCOMING]
      case ElectionStatus.UPCOMING:
        return [ElectionStatus.ACTIVE, ElectionStatus.CANCELLED]
      case ElectionStatus.ACTIVE:
        return [ElectionStatus.COMPLETED]
      default:
        return []
    }
  }

  const filteredElections = elections?.data || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Elections</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and monitor all elections
          </p>
        </div>
        
        {(user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.ADMIN) && (
          <Link href="/dashboard/elections/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Election
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search elections..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ElectionStatus | 'ALL')}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="ALL">All Status</option>
              <option value={ElectionStatus.DRAFT}>Draft</option>
              <option value={ElectionStatus.UPCOMING}>Upcoming</option>
              <option value={ElectionStatus.ACTIVE}>Active</option>
              <option value={ElectionStatus.COMPLETED}>Completed</option>
              <option value={ElectionStatus.CANCELLED}>Cancelled</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Elections List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-4">Loading elections...</p>
        </div>
      ) : filteredElections.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Vote className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Elections Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm || statusFilter !== 'ALL' 
                ? 'No elections match your current filters.'
                : 'Get started by creating your first election.'
              }
            </p>
            {(user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.ADMIN) && (
              <Link href="/dashboard/elections/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Election
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredElections.map((election) => (
            <Card key={election.id} className="election-card">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{election.title}</CardTitle>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(election.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(election.status)}`}>
                        {election.status.toLowerCase()}
                      </span>
                    </div>
                  </div>
                  
                  {canManageElection(election) && (
                    <div className="flex items-center space-x-2">
                      <Link href={`/dashboard/elections/${election.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      
                      {canDeleteElection(election) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedElection(election)
                            setDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                  {election.description}
                </p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Start: {formatDateTime(election.startDate)}</span>
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>End: {formatDateTime(election.endDate)}</span>
                  </div>
                  
                  {election._count && (
                    <>
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <Users className="w-4 h-4 mr-2" />
                        <span>{election._count.candidates} candidates</span>
                      </div>
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <Vote className="w-4 h-4 mr-2" />
                        <span>{formatNumber(election._count.votes)} votes</span>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2 pt-4 border-t">
                  <Link href={`/dashboard/elections/${election.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </Link>
                  
                  {election.status === ElectionStatus.COMPLETED && (
                    <Link href={`/dashboard/elections/${election.id}/results`}>
                      <Button variant="outline" size="sm">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Results
                      </Button>
                    </Link>
                  )}
                  
                  {canManageElection(election) && getAvailableStatusTransitions(election.status).map((status) => (
                    <Button
                      key={status}
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange(election, status)}
                      disabled={updateStatusMutation.isPending}
                    >
                      {status === ElectionStatus.ACTIVE && <Play className="w-4 h-4 mr-2" />}
                      {status === ElectionStatus.COMPLETED && <CheckCircle className="w-4 h-4 mr-2" />}
                      {status === ElectionStatus.CANCELLED && <Pause className="w-4 h-4 mr-2" />}
                      {status === ElectionStatus.UPCOMING && <Clock className="w-4 h-4 mr-2" />}
                      {status.toLowerCase()}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Election</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedElection?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteElection}
              disabled={deleteElectionMutation.isPending}
            >
              {deleteElectionMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
