import { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { searchFunds } from '../services/navService';
import { useDebounce } from '../hooks/useDebounce';
import type { Fund } from '../App';

interface FundSearchProps {
  onSelectFund: (fund: Fund) => void;
}

type FundFilter = 'all' | 'direct-growth' | 'regular-growth';

export function FundSearch({ onSelectFund }: FundSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [filter, setFilter] = useState<FundFilter>('all');
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    const search = async () => {
      setIsLoading(true);
      try {
        const data = await searchFunds(debouncedQuery);
        
        // Apply filter
        let filteredData = data;
        if (filter === 'direct-growth') {
          filteredData = data.filter(fund => {
            const name = (fund.schemeName || fund.scheme_name || '').toLowerCase();
            return name.includes('direct') && name.includes('growth');
          });
        } else if (filter === 'regular-growth') {
          filteredData = data.filter(fund => {
            const name = (fund.schemeName || fund.scheme_name || '').toLowerCase();
            return !name.includes('direct') && name.includes('growth');
          });
        }
        
        setResults(filteredData.slice(0, 10)); // Limit to 10 results
        setShowResults(true);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    search();
  }, [debouncedQuery, filter]);

  const handleSelectFund = (fund: any) => {
    console.log('[FundSearch] Selected fund:', fund);
    const fundData: Fund = {
      id: fund.schemeCode || fund.scheme_code,
      name: fund.schemeName || fund.scheme_name,
      launchDate: fund.launchDate || fund.launch_date || new Date().toISOString().split('T')[0],
      category: fund.category || 'Unknown'
    };
    console.log('[FundSearch] Fund data being added:', fundData);
    onSelectFund(fundData);
    setQuery('');
    setShowResults(false);
  };

  return (
    <div className="relative">
      <div className="space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search mutual funds..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full"
          />
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 animate-spin" />
          )}
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 font-medium">Filter:</span>
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
            className="text-xs"
          >
            All Funds
          </Button>
          <Button
            variant={filter === 'direct-growth' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('direct-growth')}
            className="text-xs"
          >
            Direct Growth
          </Button>
          <Button
            variant={filter === 'regular-growth' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('regular-growth')}
            className="text-xs"
          >
            Regular Growth
          </Button>
        </div>
      </div>

      {showResults && results.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-1 max-h-96 overflow-y-auto z-50">
          <div className="p-2">
            {results.map((fund, index) => (
              <div
                key={index}
                className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                onClick={() => handleSelectFund(fund)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm text-gray-900">
                      {fund.schemeName || fund.scheme_name}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      Code: {fund.schemeCode || fund.scheme_code}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {fund.category || 'Unknown'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {showResults && results.length === 0 && !isLoading && debouncedQuery.length >= 2 && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50">
          <div className="p-4 text-center text-gray-500">
            No funds found for "{debouncedQuery}"
          </div>
        </Card>
      )}
    </div>
  );
}