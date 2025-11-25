import React from 'react';
import { TrendingUp, Home, BarChart3, Target, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from './ui/utils';

interface NavigationProps {
  activePage: string;
  onNavigate: (page: string) => void;
  selectedFundsCount?: number;
}

export function Navigation({ activePage, onNavigate, selectedFundsCount = 0 }: NavigationProps) {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'investment-plan', label: 'Investment Plan', icon: BarChart3 },
    { id: 'retirement-plan', label: 'Retirement Plan', icon: Target },
    { id: 'financial-planning', label: 'Financial Planning', icon: FileText },
  ];

  return (
    <nav className="bg-white border-b border-slate-300 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                The Lal Street
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">Portfolio Analysis & Investment Calculator</p>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <Button
                  key={item.id}
                  variant={isActive ? 'default' : 'ghost'}
                  onClick={() => onNavigate(item.id)}
                  className={cn(
                    'flex items-center gap-2',
                    isActive && 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Button>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                // Toggle mobile menu - can be implemented later
                console.log('Mobile menu toggle');
              }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          </div>

          {/* Stats Badge */}
          {selectedFundsCount > 0 && (
            <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 border border-blue-100">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              <div className="text-left">
                <div className="text-xs text-slate-500">Portfolio</div>
                <div className="text-sm font-semibold text-slate-900">
                  {selectedFundsCount} {selectedFundsCount === 1 ? 'Fund' : 'Funds'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-slate-200 py-2">
          <div className="flex items-center justify-around">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate(item.id)}
                  className={cn(
                    'flex flex-col items-center gap-1',
                    isActive && 'text-blue-600'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs">{item.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

