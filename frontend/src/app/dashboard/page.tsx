'use client'

import { useAuth } from '@/contexts/auth-context'
import { useElections } from '@/hooks/api/use-elections'
import { useUsers } from '@/hooks/api/use-users'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Vote, 
  Users, 
  BarChart3, 
  TrendingUp,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { ElectionStatus, UserRole } from '@/types'
import { formatNumber, formatDate } from '@/lib/utils'

export default function DashboardPage() {
  const { user } = useAuth()
  
  // Fetch data based on user role
  const { data: elections } = useElections({ 
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })
  
  const { data: users } = useUsers({ 
    limit: 5,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })

  // Calculate statistics
  const totalElections = elections?.meta.total || 0
  const activeElections = elections?.data.filter(e => e.status === ElectionStatus.ACTIVE).length || 0
  const upcomingElections = elections?.data.filter(e => e.status === ElectionStatus.UPCOMING).length || 0
  const completedElections = elections?.data.filter(e => e.status === ElectionStatus.COMPLETED).length || 0
  const totalUsers = users?.meta.total || 0

  const stats = [
    {
      name: 'Total Elections',
      value: formatNumber(totalElections),
      icon: Vote,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Active Elections',
      value: formatNumber(activeElections),
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Upcoming Elections',
      value: formatNumber(upcomingElections),
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      name: 'Total Users',
      value: formatNumber(totalUsers),
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ]

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
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-blue-100 mb-4">
          Here's what's happening with your elections today.
        </p>
        {user?.role !== UserRole.VOTER && (
          <Link href="/dashboard/elections">
            <Button variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
              <Vote className="w-4 h-4 mr-2" />
              Manage Elections
            </Button>
          </Link>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.name}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Elections */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Vote className="w-5 h-5 mr-2" />
              Recent Elections
            </CardTitle>
          </CardHeader>
          <CardContent>
            {elections?.data.length ? (
              <div className="space-y-4">
                {elections.data.slice(0, 5).map((election) => (
                  <div key={election.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {election.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(election.startDate)} - {formatDate(election.endDate)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(election.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(election.status)}`}>
                        {election.status.toLowerCase()}
                      </span>
                    </div>
                  </div>
                ))}
                <Link href="/dashboard/elections">
                  <Button variant="outline" className="w-full">
                    View All Elections
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-8">
                <Vote className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No elections found</p>
                {user?.role !== UserRole.VOTER && (
                  <Link href="/dashboard/elections/new">
                    <Button className="mt-4">
                      Create First Election
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Users (Admin only) */}
        {(user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.ADMIN) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Recent Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              {users?.data.length ? (
                <div className="space-y-4">
                  {users.data.slice(0, 5).map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-primary-foreground">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {user.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs font-medium">
                        {user.role.replace('_', ' ').toLowerCase()}
                      </span>
                    </div>
                  ))}
                  <Link href="/dashboard/users">
                    <Button variant="outline" className="w-full">
                      View All Users
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No users found</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Quick Actions for Voters */}
        {user?.role === UserRole.VOTER && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Link href="/vote">
                  <Button className="w-full justify-start">
                    <Vote className="w-4 h-4 mr-2" />
                    Vote in Active Elections
                  </Button>
                </Link>
                <Link href="/results">
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Election Results
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
