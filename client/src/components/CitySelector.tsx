import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Search, Check, ChevronDown } from 'lucide-react';
import { getAllCitiesSorted, getZoneFromCity, getCityInfo } from '../utils/cityZoneMapping';

interface CitySelectorProps {
  value: string; // Format: "cityName" or "cityName|state" for disambiguation
  onChange: (cityName: string, zone: 1 | 2 | 3, state?: string) => void;
  label?: string;
  required?: boolean;
}

const POPULAR_CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad'];

export function CitySelector({ value, onChange, label = 'City/Locality', required = false }: CitySelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const allCities = useMemo(() => getAllCitiesSorted(), []);
  // Handle value format: either just city name or "cityName|state" for disambiguation
  const selectedCityInfo = useMemo(() => {
    if (!value) return null;
    // Check if value is in composite format "cityName|state"
    if (value.includes('|')) {
      const [cityName, state] = value.split('|');
      return allCities.find(c => 
        c.name.toLowerCase() === cityName.toLowerCase() && 
        c.state.toLowerCase() === state.toLowerCase()
      ) || null;
    }
    // For simple city name format, get first match
    return getCityInfo(value);
  }, [value, allCities]);

  // Filter cities based on search query
  const filteredCities = useMemo(() => {
    if (!searchQuery.trim()) {
      // Show popular cities first, then all others
      const popular = allCities.filter(c => POPULAR_CITIES.includes(c.name));
      const others = allCities.filter(c => !POPULAR_CITIES.includes(c.name));
      return [...popular, ...others];
    }

    const query = searchQuery.toLowerCase().trim();
    return allCities.filter(city => 
      city.name.toLowerCase().includes(query) || 
      city.state.toLowerCase().includes(query)
    );
  }, [searchQuery, allCities]);

  // Reset highlighted index when filtered results change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [filteredCities.length]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      setIsOpen(true);
      return;
    }

    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredCities.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0);
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredCities[highlightedIndex]) {
          const city = filteredCities[highlightedIndex];
          handleSelectCity(city.name, city.state);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchQuery('');
        inputRef.current?.blur();
        break;
    }
  };

  const handleSelectCity = (cityName: string, state?: string) => {
    // If state is provided, use it to ensure we get the correct city (for cities with same name in different states)
    let zone: 1 | 2 | 3 | null = null;
    if (state) {
      const cityInfo = allCities.find(c => 
        c.name.toLowerCase() === cityName.toLowerCase() && 
        c.state.toLowerCase() === state.toLowerCase()
      );
      zone = cityInfo?.zone || null;
    } else {
      zone = getZoneFromCity(cityName);
    }
    
    // Pass state to onChange for proper disambiguation
    onChange(cityName, zone || 1, state);
    setIsOpen(false);
    setSearchQuery('');
    inputRef.current?.blur();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setIsOpen(true);
    
    // If user typed a city name exactly, try to match it
    if (query && !isOpen) {
      setIsOpen(true);
    }
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const displayValue = isOpen 
    ? searchQuery 
    : (selectedCityInfo 
        ? `${selectedCityInfo.name}, ${selectedCityInfo.state}`
        : (value && !value.includes('|') ? value : ''));

  return (
    <div ref={containerRef} className="relative">
      <Label htmlFor="city">{label} {required && '*'}</Label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
        <Input
          id="city"
          ref={inputRef}
          type="text"
          value={isOpen ? searchQuery : displayValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder="Type to search city..."
          className="pl-10 pr-10"
          required={required}
        />
        <ChevronDown 
          className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen) {
              inputRef.current?.focus();
            }
          }}
        />
      </div>

      {/* Dropdown Results */}
      {isOpen && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 shadow-lg border-2 max-h-[400px] overflow-hidden">
          <div 
            ref={resultsRef}
            className="overflow-y-auto max-h-[400px]"
            style={{ scrollBehavior: 'smooth' }}
          >
            {filteredCities.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                No cities found for "{searchQuery}"
              </div>
            ) : (
              <>
                {!searchQuery && (
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-50 border-b sticky top-0">
                    Popular Cities
                  </div>
                )}
                {filteredCities.map((city, index) => {
                  const isHighlighted = index === highlightedIndex;
                  const isPopular = !searchQuery && POPULAR_CITIES.includes(city.name);
                  
                  return (
                    <div
                      key={`${city.name}-${city.state}`}
                      className={`
                        px-3 py-2 cursor-pointer transition-colors
                        ${isHighlighted ? 'bg-blue-50 border-l-2 border-l-blue-500' : 'hover:bg-gray-50'}
                        ${isPopular && !searchQuery ? 'font-semibold' : ''}
                      `}
                      onClick={() => handleSelectCity(city.name, city.state)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-gray-900 truncate">
                            {city.name}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {city.state}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          <span className="text-xs text-gray-400">
                            Zone {city.zone}
                          </span>
                          {(value && (
                            (value.includes('|') && value === `${city.name}|${city.state}`) ||
                            (!value.includes('|') && value === city.name && selectedCityInfo?.name === city.name)
                          )) && (
                            <Check className="h-4 w-4 text-blue-500 flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
          {filteredCities.length > 0 && (
            <div className="px-3 py-2 text-xs text-gray-400 bg-gray-50 border-t">
              {filteredCities.length} {filteredCities.length === 1 ? 'city' : 'cities'} found
              {searchQuery && ` for "${searchQuery}"`}
            </div>
          )}
        </Card>
      )}

      {/* Zone Info */}
      {selectedCityInfo && !isOpen && (
        <p className="text-xs text-gray-500 mt-1">
          Your city is categorized as Zone {selectedCityInfo.zone}
          {selectedCityInfo.zone === 1 ? ' (Metro)' : selectedCityInfo.zone === 2 ? ' (Tier-1)' : ' (Rest of India)'}
        </p>
      )}
    </div>
  );
}

