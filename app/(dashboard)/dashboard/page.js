'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import StatsWidget from '@/components/ui/StatsWidget';
import AlertBanner from '@/components/ui/AlertBanner';
import ActivityTimeline from '@/components/ui/ActivityTimeline';
import { AlertTriangle, CheckCircle, CheckCircle2, Clock, TrendingUp, FileText, ArrowRight, Shield, ClipboardCheck } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, assignmentsRes] = await Promise.all([
          fetch('/api/dashboard/stats', { credentials: 'include' }),
          fetch('/api/assignments?limit=5', { credentials: 'include' }),
        ]);

        if (!statsRes.ok || !assignmentsRes.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const statsData = await statsRes.json();
        const assignmentsData = await assignmentsRes.json();

        setStats(statsData.data);
        setRecentActivity(assignmentsData.data?.assignments || []);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const overdueCount = stats?.overdueAssignments || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Overview of your risk management activities</p>
      </div>

      {overdueCount > 0 && (
        <AlertBanner
          variant="warning"
          title="Overdue Assignments"
          message={`You have ${overdueCount} overdue assignment${overdueCount > 1 ? 's' : ''} requiring immediate attention.`}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsWidget
          title="Total Risks"
          value={stats?.totalRisks || 0}
          icon={AlertTriangle}
          trend={stats?.riskTrend}
          color="blue"
        />
        <StatsWidget
          title="Critical Priority"
          value={stats?.criticalRisks || 0}
          icon={AlertTriangle}
          color="red"
        />
        <StatsWidget
          title="Active Assignments"
          value={stats?.activeAssignments || 0}
          icon={Clock}
          color="yellow"
        />
        <StatsWidget
          title="Resolved Risks"
          value={stats?.resolvedRisks || 0}
          icon={CheckCircle}
          trend={stats?.resolutionTrend}
          color="green"
        />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Workflows</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Risk Reports</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Track and manage risk reporting activities</p>
              {stats?.totalReports !== undefined && (
                <p className="text-sm text-gray-500 mb-4">
                  {stats.totalReports} {stats.totalReports === 1 ? 'report' : 'reports'}
                </p>
              )}
              <Link href="/risk-reports">
                <Button variant="outline" className="w-full group">
                  View Reports
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Mitigation Plans</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Track mitigation actions and effectiveness</p>
              {stats?.totalMitigationPlans !== undefined && (
                <p className="text-sm text-gray-500 mb-4">
                  {stats.totalMitigationPlans} {stats.totalMitigationPlans === 1 ? 'plan' : 'plans'}
                </p>
              )}
              <Link href="/mitigation-plans">
                <Button variant="outline" className="w-full group">
                  View Plans
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <CheckCircle2 className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Risk Resolutions</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Track and manage resolved risks and follow-up actions</p>
              {stats?.totalResolutions !== undefined && (
                <p className="text-sm text-gray-500 mb-4">
                  {stats.totalResolutions} {stats.totalResolutions === 1 ? 'resolution' : 'resolutions'}
                </p>
              )}
              <Link href="/risk-resolutions">
                <Button variant="outline" className="w-full group">
                  View Resolutions
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <ClipboardCheck className="h-6 w-6 text-amber-600" />
                </div>
                <CardTitle>Risk Evaluations</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Track evaluation results and effectiveness</p>
              {stats?.totalEvaluations !== undefined && (
                <p className="text-sm text-gray-500 mb-4">
                  {stats.totalEvaluations} {stats.totalEvaluations === 1 ? 'evaluation' : 'evaluations'}
                </p>
              )}
              <Link href="/risk-evaluations">
                <Button variant="outline" className="w-full group">
                  View Evaluations
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Risk Distribution by Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.risksByPriority?.map((item) => (
                <div key={item.priority} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-3 w-3 rounded-full ${
                        item.priority === 'Critical'
                          ? 'bg-red-500'
                          : item.priority === 'High'
                          ? 'bg-orange-500'
                          : item.priority === 'Medium'
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}
                    />
                    <span className="font-medium">{item.priority}</span>
                  </div>
                  <span className="text-2xl font-bold">{item.count}</span>
                </div>
              )) || (
                <p className="text-gray-500 text-center py-4">No risk data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assignment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.assignmentsByStatus?.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <span className="font-medium">{item.status}</span>
                  <span className="text-2xl font-bold">{item.count}</span>
                </div>
              )) || (
                <p className="text-gray-500 text-center py-4">No assignment data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityTimeline activities={recentActivity} />
        </CardContent>
      </Card>
    </div>
  );
}