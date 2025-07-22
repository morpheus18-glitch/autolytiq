import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Car,
  FileText,
  Plus,
  X,
  ArrowRight,
  DollarSign,
  Calendar,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Building,
} from 'lucide-react';
import { Link, useLocation } from 'wouter';

interface WorkspaceSession {
  id: string;
  name: string;
  customer?: {
    id: number;
    name: string;
    email?: string;
  };
  vehicle?: {
    id: number;
    make: string;
    model: string;
    year: number;
    price: number;
  };
  deal?: {
    id: string;
    status: string;
    totalAmount?: number;
  };
  currentModule: string;
  isActive: boolean;
}

export function SimpleSessionBar() {
  const [isVisible, setIsVisible] = useState(true);
  const [sessions, setSessions] = useState<WorkspaceSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [location, navigate] = useLocation();

  // Initialize with a default session
  useEffect(() => {
    if (sessions.length === 0) {
      const defaultSession: WorkspaceSession = {
        id: `session_${Date.now()}`,
        name: 'Main Session',
        currentModule: getCurrentModule(location),
        isActive: true,
      };
      setSessions([defaultSession]);
      setActiveSessionId(defaultSession.id);
    }
  }, []);

  const getCurrentModule = (path: string): string => {
    if (path.startsWith('/customers')) return 'customer';
    if (path.startsWith('/inventory')) return 'inventory';
    if (path.startsWith('/showroom-manager')) return 'showroom';
    if (path.startsWith('/deal-desk')) return 'deal-desk';
    return 'dashboard';
  };

  const activeSession = sessions.find(s => s.id === activeSessionId);

  const createNewSession = () => {
    const newSession: WorkspaceSession = {
      id: `session_${Date.now()}`,
      name: `Session ${sessions.length + 1}`,
      currentModule: 'dashboard',
      isActive: false,
    };
    setSessions([...sessions, newSession]);
    setActiveSessionId(newSession.id);
  };

  const closeSession = (sessionId: string) => {
    const remainingSessions = sessions.filter(s => s.id !== sessionId);
    setSessions(remainingSessions);
    
    if (sessionId === activeSessionId) {
      const newActiveSession = remainingSessions[remainingSessions.length - 1];
      setActiveSessionId(newActiveSession?.id || null);
    }
  };

  const addCustomerToSession = (customer: any) => {
    if (activeSession) {
      setSessions(sessions.map(s => 
        s.id === activeSession.id 
          ? { ...s, customer: { id: customer.id, name: `${customer.firstName} ${customer.lastName}`, email: customer.email } }
          : s
      ));
    }
  };

  const addVehicleToSession = (vehicle: any) => {
    if (activeSession) {
      setSessions(sessions.map(s => 
        s.id === activeSession.id 
          ? { ...s, vehicle: { id: vehicle.id, make: vehicle.make, model: vehicle.model, year: vehicle.year, price: vehicle.price } }
          : s
      ));
    }
  };

  const startDeal = () => {
    if (activeSession && activeSession.customer && activeSession.vehicle) {
      const deal = {
        id: `deal_${Date.now()}`,
        status: 'draft',
        totalAmount: activeSession.vehicle.price,
      };
      
      setSessions(sessions.map(s => 
        s.id === activeSession.id 
          ? { ...s, deal, currentModule: 'deal-desk' }
          : s
      ));
      
      navigate('/deal-desk');
    }
  };

  const handleQuickNavigation = (path: string, module: string) => {
    if (activeSession) {
      setSessions(sessions.map(s => 
        s.id === activeSession.id 
          ? { ...s, currentModule: module }
          : s
      ));
    }
    navigate(path);
  };

  if (!isVisible) {
    return (
      <div className="fixed top-20 right-4 z-50">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsVisible(true)}
          className="shadow-lg bg-white dark:bg-gray-800"
        >
          <ChevronDown className="w-4 h-4 mr-1" />
          Workspace
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed top-20 right-4 w-80 z-50 bg-white dark:bg-gray-900 rounded-lg border shadow-xl max-h-96 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900 dark:to-green-900 rounded-t-lg">
        <div className="flex items-center space-x-2">
          <Building className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-sm text-gray-900 dark:text-white">Enterprise Workspace</h3>
        </div>
        <div className="flex items-center space-x-2">
          <Button size="sm" variant="ghost" onClick={createNewSession} className="text-xs">
            <Plus className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setIsVisible(false)} className="text-xs">
            <ChevronUp className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Session Tabs */}
      {sessions.length > 1 && (
        <div className="p-2 border-b bg-gray-50 dark:bg-gray-800">
          <div className="flex space-x-1 overflow-x-auto">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`flex items-center space-x-2 px-2 py-1 rounded text-xs cursor-pointer min-w-0 ${
                  session.id === activeSessionId
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                    : 'bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
                onClick={() => setActiveSessionId(session.id)}
              >
                <span className="truncate max-w-16 font-medium">{session.name}</span>
                {sessions.length > 1 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="p-0 h-4 w-4 hover:bg-red-100 dark:hover:bg-red-900"
                    onClick={(e) => {
                      e.stopPropagation();
                      closeSession(session.id);
                    }}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Session Context */}
      {activeSession && (
        <div className="p-4 space-y-4">
          {/* Context Cards */}
          <div className="space-y-2">
            {activeSession.customer && (
              <Card className="p-3 bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="font-medium text-sm text-blue-900 dark:text-blue-100">
                        {activeSession.customer.name}
                      </p>
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        {activeSession.customer.email}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleQuickNavigation(`/customers/${activeSession.customer?.id}`, 'customer')}
                    className="text-blue-600"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </Card>
            )}

            {activeSession.vehicle && (
              <Card className="p-3 bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Car className="w-4 h-4 text-green-600" />
                    <div>
                      <p className="font-medium text-sm text-green-900 dark:text-green-100">
                        {activeSession.vehicle.year} {activeSession.vehicle.make} {activeSession.vehicle.model}
                      </p>
                      <p className="text-xs text-green-700 dark:text-green-300">
                        ${activeSession.vehicle.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleQuickNavigation(`/inventory/${activeSession.vehicle?.id}`, 'inventory')}
                    className="text-green-600"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </Card>
            )}

            {activeSession.deal && (
              <Card className="p-3 bg-purple-50 dark:bg-purple-900 border-purple-200 dark:border-purple-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-purple-600" />
                    <div>
                      <p className="font-medium text-sm text-purple-900 dark:text-purple-100">
                        Deal #{activeSession.deal.id.slice(-8)}
                      </p>
                      <p className="text-xs text-purple-700 dark:text-purple-300">
                        {activeSession.deal.totalAmount ? `$${activeSession.deal.totalAmount.toLocaleString()}` : 'Draft'}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleQuickNavigation(`/deal-desk`, 'deal-desk')}
                    className="text-purple-600"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* Quick Actions */}
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-gray-500 uppercase">Quick Navigation</h4>
            <div className="grid grid-cols-2 gap-2">
              <Button
                size="sm"
                variant="outline"
                className="text-xs"
                onClick={() => handleQuickNavigation('/customers', 'customer')}
              >
                <User className="w-3 h-3 mr-1" />
                Customers
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-xs"
                onClick={() => handleQuickNavigation('/inventory', 'inventory')}
              >
                <Car className="w-3 h-3 mr-1" />
                Inventory
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-xs"
                onClick={() => handleQuickNavigation('/showroom-manager', 'showroom')}
              >
                <Calendar className="w-3 h-3 mr-1" />
                Showroom
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-xs"
                onClick={() => handleQuickNavigation('/deal-desk', 'deal-desk')}
              >
                <FileText className="w-3 h-3 mr-1" />
                Deal Desk
              </Button>
            </div>
          </div>

          {/* Workflow Actions */}
          {(activeSession.customer || activeSession.vehicle) && (
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-gray-500 uppercase">Smart Workflows</h4>
              <div className="space-y-1">
                {activeSession.customer && !activeSession.vehicle && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-full text-xs bg-blue-100 hover:bg-blue-200 text-blue-800"
                    onClick={() => handleQuickNavigation('/inventory', 'inventory')}
                  >
                    <ArrowRight className="w-3 h-3 mr-1" />
                    Select Vehicle for {activeSession.customer.name.split(' ')[0]}
                  </Button>
                )}
                
                {activeSession.vehicle && !activeSession.customer && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-full text-xs bg-green-100 hover:bg-green-200 text-green-800"
                    onClick={() => handleQuickNavigation('/customers', 'customer')}
                  >
                    <ArrowRight className="w-3 h-3 mr-1" />
                    Select Customer for {activeSession.vehicle.year} {activeSession.vehicle.make}
                  </Button>
                )}
                
                {activeSession.customer && activeSession.vehicle && !activeSession.deal && (
                  <Button
                    size="sm"
                    variant="default"
                    className="w-full text-xs bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
                    onClick={startDeal}
                  >
                    <DollarSign className="w-3 h-3 mr-1" />
                    Start Deal Process
                  </Button>
                )}
                
                {activeSession.deal && (
                  <Button
                    size="sm"
                    variant="default"
                    className="w-full text-xs bg-purple-500 hover:bg-purple-600"
                    onClick={() => handleQuickNavigation('/deal-desk', 'deal-desk')}
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
              <span>Current: <Badge variant="secondary" className="text-xs ml-1">{activeSession.currentModule}</Badge></span>
              <Badge variant="outline" className="text-xs">
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
          <Button size="sm" onClick={createNewSession}>
            Create Session
          </Button>
        </div>
      )}
    </div>
  );
}