import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { Calculator, TrendingUp, DollarSign, BarChart3, Layers } from 'lucide-react';
import type { CalculatorType } from '../App';

interface CalculatorButtonsProps {
  activeCalculator: CalculatorType;
  onSelectCalculator: (calculator: CalculatorType) => void;
}

export function CalculatorButtons({ activeCalculator, onSelectCalculator }: CalculatorButtonsProps) {
  return (
    <Tabs value={activeCalculator || ''} onValueChange={(value) => onSelectCalculator(value as CalculatorType)}>
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1 sm:gap-2">
        <TabsTrigger value="SIP" className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm">
          <Calculator className="h-3 w-3 sm:h-4 sm:w-4" />
          <span>SIP</span>
        </TabsTrigger>
        <TabsTrigger value="SIPLumpsum" className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm">
          <Layers className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">SIP + Lumpsum</span>
          <span className="sm:hidden">SIP+L</span>
        </TabsTrigger>
        <TabsTrigger value="Lumpsum" className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm">
          <DollarSign className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Lumpsum</span>
          <span className="sm:hidden">Lump</span>
        </TabsTrigger>
        <TabsTrigger value="Rolling" className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm">
          <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden md:inline">Rolling Returns</span>
          <span className="md:hidden">Rolling</span>
        </TabsTrigger>
        <TabsTrigger value="SWP" className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm">
          <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
          <span>SWP</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}