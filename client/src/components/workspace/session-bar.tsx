import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  User,
  Car,
  FileText,
  Plus,
  X,
  ArrowRight,
  DollarSign,
  Calendar,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from 'lucide-react';
import { useWorkspaceStore } from '@/stores/workspace-context';
import { Link, useLocation } from 'wouter';

export function SessionBar() {
  const {
    sessions,
    activeSessionId,
    isSessionBarVisible,
    createSession,
    activateSession,
    closeSession,
    toggleSessionBar,
    getActiveSession,
    setCurrentModule,
  } = useWorkspaceStore();
  
  const session = getActiveSession();
  const [, navigate] = useLocation();

  if (!isSessionBarVisible) {
    return (
      <div className="fixed top-20 right-4 z-50">
        <Button
          size="sm"
          variant="outline"
          onClick={toggleSessionBar}
          className="shadow-lg"
        >
          <ChevronDown className="w-4 h-4" />
          Workspace
        </Button>
      </div>
    );
  }

  const handleQuickNavigation = (module: string, path: string) => {
    if (session) {
      setCurrentModule(session.id, module as any);
      navigate(path);
    }
  };

  const handleCreateNewSession = () => {
    const sessionName = `Session ${sessions.length + 1}`;
    createSession(sessionName, 'dashboard');
  };

  return (
    <div className="fixed top-20 right-4 w-80 z-50 bg-white dark:bg-gray-900 rounded-lg border shadow-xl">
      {/* Session Bar Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="font-semibold text-sm">Workspace Sessions</h3>
        <div className="flex items-center space-x-2">
          <Button size="sm" variant="ghost" onClick={handleCreateNewSession}>
            <Plus className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={toggleSessionBar}>
            <ChevronUp className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Session Tabs */}
      {sessions.length > 0 && (
        <div className="p-2 border-b">
          <div className="flex space-x-1 overflow-x-auto">
            {sessions.map((sess: any) => (
              <div
                key={sess.id}
                className={`flex items-center space-x-2 px-2 py-1 rounded text-xs cursor-pointer min-w-0 ${
                  sess.id === activeSessionId
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
                onClick={() => activateSession(sess.id)}
              >
                <span className="truncate max-w-16">{sess.name}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="p-0 h-4 w-4 hover:bg-red-100 dark:hover:bg-red-900"
                  onClick={(e) => {
                    e.stopPropagation();
                    closeSession(sess.id);
                  }}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Session Context */}
      {session && (
        <div className="p-4 space-y-4">
          {/* Current Context Cards */}
          <div className="space-y-2">
            {session.customer && (
              <Card className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-blue-500" />
                    <div>
                      <p className="font-medium text-sm">
                        {session.customer.firstName} {session.customer.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{session.customer.email}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleQuickNavigation('customer', `/customers/${session.customer?.id}`)}
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </Card>
            )}

            {session.vehicle && (
              <Card className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Car className="w-4 h-4 text-green-500" />
                    <div>
                      <p className="font-medium text-sm">
                        {session.vehicle.year} {session.vehicle.make} {session.vehicle.model}
                      </p>
                      <p className="text-xs text-gray-500">
                        ${session.vehicle.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleQuickNavigation('inventory', `/inventory/${session.vehicle?.id}`)}
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </Card>
            )}

            {session.deal && (
              <Card className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-purple-500" />
                    <div>
                      <p className="font-medium text-sm">Deal #{session.deal.id}</p>
                      <p className="text-xs text-gray-500">
                        {session.deal.totalAmount ? `$${session.deal.totalAmount.toLocaleString()}` : 'Draft'}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleQuickNavigation('deal-desk', `/deal-desk/${session.deal?.id}`)}
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* Quick Actions */}
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-gray-500 uppercase">Quick Actions</h4>
            <div className="grid grid-cols-2 gap-2">
              <Button
                size="sm"
                variant="outline"
                className="text-xs"
                onClick={() => handleQuickNavigation('customer', '/customers')}
              >
                <User className="w-3 h-3 mr-1" />
                Customer
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-xs"
                onClick={() => handleQuickNavigation('inventory', '/inventory')}
              >
                <Car className="w-3 h-3 mr-1" />
                Inventory
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-xs"
                onClick={() => handleQuickNavigation('showroom', '/showroom-manager')}
              >
                <Calendar className="w-3 h-3 mr-1" />
                Showroom
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-xs"
                onClick={() => handleQuickNavigation('deal-desk', '/deal-desk')}
              >
                <FileText className="w-3 h-3 mr-1" />
                Deal Desk
              </Button>
            </div>
          </div>

          {/* Workflow Actions */}
          {(session.customer || session.vehicle) && (
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-gray-500 uppercase">Workflow</h4>
              <div className="space-y-1">
                {session.customer && !session.vehicle && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-full text-xs"
                    onClick={() => handleQuickNavigation('inventory', '/inventory')}
                  >
                    <ArrowRight className="w-3 h-3 mr-1" />
                    Select Vehicle
                  </Button>
                )}
                {session.vehicle && !session.customer && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-full text-xs"
                    onClick={() => handleQuickNavigation('customer', '/customers')}
                  >
                    <ArrowRight className="w-3 h-3 mr-1" />
                    Select Customer
                  </Button>
                )}
                {session.customer && session.vehicle && !session.deal && (
                  <Button
                    size="sm"
                    variant="default"
                    className="w-full text-xs"
                    onClick={() => {
                      // Create new deal and navigate
                      const dealId = `deal_${Date.now()}`;
                      useWorkspaceStore.getState().setDeal(session.id, {
                        id: dealId,
                        customerId: session.customer?.id,
                        vehicleId: session.vehicle?.id,
                        status: 'draft',
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                      });
                      handleQuickNavigation('deal-desk', `/deal-desk`);
                    }}
                  >
                    <DollarSign className="w-3 h-3 mr-1" />
                    Start Deal
                  </Button>
                )}
                {session.deal && (
                  <Button
                    size="sm"
                    variant="default"
                    className="w-full text-xs"
                    onClick={() => handleQuickNavigation('deal-desk', `/deal-desk/${session.deal?.id}`)}
                  >
                    <FileText className="w-3 h-3 mr-1" />
                    Continue Deal
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Session Info */}
          <div className="text-xs text-gray-500 pt-2 border-t">
            <div className="flex items-center justify-between">
              <span>Module: {session.currentModule}</span>
              <Badge variant="secondary" className="text-xs">
                {sessions.length} session{sessions.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {sessions.length === 0 && (
        <div className="p-6 text-center">
          <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-3">No active sessions</p>
          <Button size="sm" onClick={handleCreateNewSession}>
            Create Session
          </Button>
        </div>
      )}
    </div>
  );
}