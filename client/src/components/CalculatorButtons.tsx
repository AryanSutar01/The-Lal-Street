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
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="SIP" className="flex items-center gap-2">
          <Calculator className="h-4 w-4" />
          SIP
        </TabsTrigger>
        <TabsTrigger value="SIPLumpsum" className="flex items-center gap-2">
          <Layers className="h-4 w-4" />
          SIP + Lumpsum
        </TabsTrigger>
        <TabsTrigger value="Lumpsum" className="flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          Lumpsum
        </TabsTrigger>
        <TabsTrigger value="Rolling" className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Rolling Returns
        </TabsTrigger>
        <TabsTrigger value="SWP" className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          SWP
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}