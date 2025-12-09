import { useState, useEffect, useMemo } from 'react';
import { Search, Loader2, X, Filter, ChevronDown, ChevronUp } from 'lucide-react';
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

type PlanType = 'all' | 'direct' | 'regular';
type OptionType = 'all' | 'growth' | 'dividend';

const FUND_CATEGORIES = [
  'Equity',
  'Debt',
  'Hybrid',
  'ELSS',
  'Index',
  'ETF',
  'Money Market',
  'Gilt',
  'Arbitrage',
  'Others',
];

const ASSET_CLASSES = [
  'Large Cap',
  'Mid Cap',
  'Small Cap',
  'Flexi Cap',
  'Multi Cap',
  'Large & Mid Cap',
  'Sectoral',
  'Thematic',
  'Value',
  'Contra',
  'Focused',
  'Others',
];

interface Filters {
  planType: PlanType;
  optionType: OptionType;
  category: string; // 'all' or specific category
  assetClass: string; // 'all' or specific asset class (only relevant for Equity)
}

export function FundSearch({ onSelectFund }: FundSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [allResults, setAllResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState<Filters>({
    planType: 'all',
    optionType: 'all',
    category: 'all',
    assetClass: 'all',
  });

  const debouncedQuery = useDebounce(query, 300);

  // Fetch funds when query changes
  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults([]);
      setAllResults([]);
      setShowResults(false);
      return;
    }

    const search = async () => {
      setIsLoading(true);
      try {
        const data = await searchFunds(debouncedQuery);
        setAllResults(data);
        setShowResults(true);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
        setAllResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    search();
  }, [debouncedQuery]);

  // Apply filters to results
  useEffect(() => {
    if (allResults.length === 0) {
      setResults([]);
      return;
    }

    let filtered = [...allResults];

    // Filter by plan type (Direct/Regular)
    if (filters.planType !== 'all') {
      filtered = filtered.filter(fund => {
        const name = (fund.schemeName || fund.scheme_name || '').toLowerCase();
        if (filters.planType === 'direct') {
          return name.includes('direct');
        } else {
          return !name.includes('direct');
        }
      });
    }

    // Filter by option type (Growth/Dividend)
    if (filters.optionType !== 'all') {
      filtered = filtered.filter(fund => {
        const name = (fund.schemeName || fund.scheme_name || '').toLowerCase();
        return name.includes(filters.optionType);
      });
    }

    // Filter by category
    if (filters.category !== 'all') {
      filtered = filtered.filter(fund => {
        const category = (fund.category || 'Unknown').toLowerCase();
        return category === filters.category.toLowerCase() || 
               category.includes(filters.category.toLowerCase());
      });
    }

    // Filter by asset class (only for Equity category)
    if (filters.assetClass !== 'all') {
      filtered = filtered.filter(fund => {
        const name = (fund.schemeName || fund.scheme_name || '').toLowerCase();
        const assetClass = filters.assetClass.toLowerCase();
        
        // Match asset class patterns in fund name
        const assetClassMap: Record<string, string[]> = {
          'large cap': ['large cap', 'large-cap', 'largecap'],
          'mid cap': ['mid cap', 'mid-cap', 'midcap'],
          'small cap': ['small cap', 'small-cap', 'smallcap'],
          'flexi cap': ['flexi cap', 'flexi-cap', 'flexicap'],
          'multi cap': ['multi cap', 'multi-cap', 'multicap'],
          'large & mid cap': ['large & mid cap', 'large and mid cap', 'large-mid cap'],
          'sectoral': ['sectoral', 'sector'],
          'thematic': ['thematic', 'theme'],
          'value': ['value'],
          'contra': ['contra'],
          'focused': ['focused'],
        };

        const patterns = assetClassMap[assetClass] || [assetClass];
        return patterns.some(pattern => name.includes(pattern));
      });
    }

    setResults(filtered.slice(0, 15)); // Limit to 15 results
  }, [allResults, filters]);

  const hasActiveFilters = 
    filters.planType !== 'all' ||
    filters.optionType !== 'all' ||
    filters.category !== 'all' ||
    filters.assetClass !== 'all';

  const clearAllFilters = () => {
    setFilters({
      planType: 'all',
      optionType: 'all',
      category: 'all',
      assetClass: 'all',
    });
  };

  const toggleFilter = (type: keyof Filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type] === value ? 'all' : value,
    }));
  };

  const handleSelectFund = (fund: any) => {
    const fundData: Fund = {
      id: fund.schemeCode || fund.scheme_code,
      name: fund.schemeName || fund.scheme_name,
      launchDate: fund.launchDate || fund.launch_date || new Date().toISOString().split('T')[0],
      category: fund.category || 'Unknown'
    };
    onSelectFund(fundData);
    setQuery('');
    setShowResults(false);
    setShowFilters(false);
  };

  // Get unique categories from results
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    allResults.forEach(fund => {
      const cat = fund.category || 'Unknown';
      if (cat && cat !== 'Unknown') {
        cats.add(cat);
      }
    });
    return Array.from(cats).sort();
  }, [allResults]);

  return (
    <div className="relative">
      <div className="space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search mutual funds by name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full"
            onFocus={() => {
              if (allResults.length > 0) setShowResults(true);
            }}
          />
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 animate-spin" />
          )}
        </div>

        {/* Filters Toggle */}
        {allResults.length > 0 && (
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="text-xs"
            >
              <Filter className="h-3 w-3 mr-1" />
              Filters
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2 h-4 px-1.5 text-xs">
                  {[filters.planType !== 'all' ? 1 : 0, 
                    filters.optionType !== 'all' ? 1 : 0,
                    filters.category !== 'all' ? 1 : 0,
                    filters.assetClass !== 'all' ? 1 : 0].reduce((a, b) => a + b, 0)}
                </Badge>
              )}
              {showFilters ? (
                <ChevronUp className="h-3 w-3 ml-1" />
              ) : (
                <ChevronDown className="h-3 w-3 ml-1" />
              )}
            </Button>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-xs text-red-600 hover:text-red-700"
              >
                <X className="h-3 w-3 mr-1" />
                Clear All
              </Button>
            )}
          </div>
        )}

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2">
            {filters.planType !== 'all' && (
              <Badge 
                variant="secondary" 
                className="cursor-pointer hover:bg-gray-300 text-xs"
                onClick={() => toggleFilter('planType', filters.planType)}
              >
                {filters.planType === 'direct' ? 'Direct' : 'Regular'}
                <X className="h-3 w-3 ml-1 inline" />
              </Badge>
            )}
            {filters.optionType !== 'all' && (
              <Badge 
                variant="secondary" 
                className="cursor-pointer hover:bg-gray-300 text-xs"
                onClick={() => toggleFilter('optionType', filters.optionType)}
              >
                {filters.optionType === 'growth' ? 'Growth' : 'Dividend'}
                <X className="h-3 w-3 ml-1 inline" />
              </Badge>
            )}
            {filters.category !== 'all' && (
              <Badge 
                variant="secondary" 
                className="cursor-pointer hover:bg-gray-300 text-xs"
                onClick={() => toggleFilter('category', filters.category)}
              >
                {filters.category}
                <X className="h-3 w-3 ml-1 inline" />
              </Badge>
            )}
            {filters.assetClass !== 'all' && (
              <Badge 
                variant="secondary" 
                className="cursor-pointer hover:bg-gray-300 text-xs"
                onClick={() => toggleFilter('assetClass', filters.assetClass)}
              >
                {filters.assetClass}
                <X className="h-3 w-3 ml-1 inline" />
              </Badge>
            )}
          </div>
        )}

        {/* Filters Panel */}
        {showFilters && allResults.length > 0 && (
          <Card className="p-4 border-2">
            <div className="space-y-4">
              {/* Plan Type */}
              <div>
                <Label className="text-xs font-semibold text-gray-700 mb-2 block">
                  Plan Type
                </Label>
                <div className="flex flex-wrap gap-2">
                  <FilterChip
                    label="All Plans"
                    isActive={filters.planType === 'all'}
                    onClick={() => toggleFilter('planType', 'all')}
                  />
                  <FilterChip
                    label="Direct"
                    isActive={filters.planType === 'direct'}
                    onClick={() => toggleFilter('planType', 'direct')}
                  />
                  <FilterChip
                    label="Regular"
                    isActive={filters.planType === 'regular'}
                    onClick={() => toggleFilter('planType', 'regular')}
                  />
                </div>
              </div>

              {/* Option Type */}
              <div>
                <Label className="text-xs font-semibold text-gray-700 mb-2 block">
                  Option Type
                </Label>
                <div className="flex flex-wrap gap-2">
                  <FilterChip
                    label="All Options"
                    isActive={filters.optionType === 'all'}
                    onClick={() => toggleFilter('optionType', 'all')}
                  />
                  <FilterChip
                    label="Growth"
                    isActive={filters.optionType === 'growth'}
                    onClick={() => toggleFilter('optionType', 'growth')}
                  />
                  <FilterChip
                    label="Dividend"
                    isActive={filters.optionType === 'dividend'}
                    onClick={() => toggleFilter('optionType', 'dividend')}
                  />
                </div>
              </div>

              {/* Fund Category */}
              <div>
                <Label className="text-xs font-semibold text-gray-700 mb-2 block">
                  Fund Category
                </Label>
                <div className="flex flex-wrap gap-2">
                  <FilterChip
                    label="All Categories"
                    isActive={filters.category === 'all'}
                    onClick={() => toggleFilter('category', 'all')}
                  />
                  {(availableCategories.length > 0 ? availableCategories : FUND_CATEGORIES).map(cat => (
                    <FilterChip
                      key={cat}
                      label={cat}
                      isActive={filters.category.toLowerCase() === cat.toLowerCase()}
                      onClick={() => toggleFilter('category', cat)}
                    />
                  ))}
                </div>
              </div>

              {/* Asset Class (only show if Equity is selected or all) */}
              {(filters.category === 'all' || filters.category.toLowerCase().includes('equity')) && (
                <div>
                  <Label className="text-xs font-semibold text-gray-700 mb-2 block">
                    Asset Class <span className="text-gray-500 font-normal">(for Equity)</span>
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    <FilterChip
                      label="All Asset Classes"
                      isActive={filters.assetClass === 'all'}
                      onClick={() => toggleFilter('assetClass', 'all')}
                    />
                    {ASSET_CLASSES.map(ac => (
                      <FilterChip
                        key={ac}
                        label={ac}
                        isActive={filters.assetClass.toLowerCase() === ac.toLowerCase()}
                        onClick={() => toggleFilter('assetClass', ac)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>

      {/* Search Results */}
      {showResults && results.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-1 max-h-96 overflow-y-auto z-50 shadow-lg border-2">
          <div className="p-2">
            <div className="text-xs text-gray-600 px-2 py-1 mb-1 border-b">
              Found {results.length} of {allResults.length} funds
            </div>
            {results.map((fund, index) => (
              <div
                key={index}
                className="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0 transition-colors"
                onClick={() => handleSelectFund(fund)}
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-gray-900 truncate">
                      {fund.schemeName || fund.scheme_name}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      Code: {fund.schemeCode || fund.scheme_code}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs flex-shrink-0">
                    {fund.category || 'Unknown'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {showResults && results.length === 0 && !isLoading && debouncedQuery.length >= 2 && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 shadow-lg border-2">
          <div className="p-4 text-center text-gray-500">
            {hasActiveFilters 
              ? `No funds found matching your filters for "${debouncedQuery}"`
              : `No funds found for "${debouncedQuery}"`
            }
          </div>
        </Card>
      )}
    </div>
  );
}

// Filter Chip Component
interface FilterChipProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function FilterChip({ label, isActive, onClick }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        px-3 py-1.5 rounded-full text-xs font-medium transition-all
        ${isActive 
          ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
        }
      `}
    >
      {label}
    </button>
  );
}

// Label Component
function Label({ className, children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={className} {...props}>
      {children}
    </label>
  );
}
