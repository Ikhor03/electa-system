import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Vote, 
  Shield, 
  BarChart3, 
  Users, 
  CheckCircle, 
  Lock,
  Globe,
  Zap
} from 'lucide-react'

export default function Home() {
  const features = [
    {
      icon: Shield,
      title: 'Secure & Transparent',
      description: 'End-to-end encryption with anonymous voting and comprehensive audit trails.'
    },
    {
      icon: Users,
      title: 'Role-Based Access',
      description: 'Multi-level user management with granular permissions for administrators and operators.'
    },
    {
      icon: BarChart3,
      title: 'Real-Time Results',
      description: 'Live vote counting with interactive charts and detailed analytics.'
    },
    {
      icon: Globe,
      title: 'Public Accessibility',
      description: 'Mobile-friendly interface accessible to all voters without requiring accounts.'
    },
    {
      icon: Lock,
      title: 'Data Privacy',
      description: 'Voter anonymity protection with secure data handling and GDPR compliance.'
    },
    {
      icon: Zap,
      title: 'High Performance',
      description: 'Scalable architecture supporting thousands of concurrent voters.'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-full mb-8">
              <Vote className="w-10 h-10 text-primary-foreground" />
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Electa
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-4">
              Secure Election Management System
            </p>
            
            <p className="text-lg text-gray-500 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
              Empowering democratic processes with cutting-edge technology. 
              Transparent, secure, and accessible elections for the digital age.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/vote">
                <Button size="lg" className="text-lg px-8 py-4">
                  <Vote className="w-5 h-5 mr-2" />
                  Vote Now
                </Button>
              </Link>
              
              <Link href="/results">
                <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  View Results
                </Button>
              </Link>
              
              <Link href="/login">
                <Button variant="secondary" size="lg" className="text-lg px-8 py-4">
                  <Users className="w-5 h-5 mr-2" />
                  Admin Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-32 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-1/2 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Electa?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Built with modern technology and security best practices to ensure 
              fair, transparent, and accessible elections.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <CardHeader className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4 mx-auto">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 text-center">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">99.9%</div>
              <div className="text-gray-600 dark:text-gray-300">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">256-bit</div>
              <div className="text-gray-600 dark:text-gray-300">Encryption</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">10K+</div>
              <div className="text-gray-600 dark:text-gray-300">Concurrent Voters</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">24/7</div>
              <div className="text-gray-600 dark:text-gray-300">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Modernize Your Elections?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join organizations worldwide who trust Electa for their democratic processes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
                <CheckCircle className="w-5 h-5 mr-2" />
                Get Started
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg px-8 py-4 text-white border-white hover:bg-white hover:text-blue-600">
                <Users className="w-5 h-5 mr-2" />
                Admin Access
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Vote className="w-8 h-8 text-primary" />
              <div>
                <h3 className="text-xl font-bold">Electa</h3>
                <p className="text-sm text-gray-400">by Nyce Up</p>
              </div>
            </div>
            
            <div className="flex space-x-6">
              <Link href="/vote" className="text-gray-300 hover:text-white transition-colors">
                Vote
              </Link>
              <Link href="/results" className="text-gray-300 hover:text-white transition-colors">
                Results
              </Link>
              <Link href="/login" className="text-gray-300 hover:text-white transition-colors">
                Login
              </Link>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Electa by Nyce Up. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
