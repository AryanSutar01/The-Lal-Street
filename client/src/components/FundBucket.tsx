import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Trash2 } from 'lucide-react';
import type { SelectedFund } from '../App';

interface FundBucketProps {
  funds: SelectedFund[];
  onRemoveFund: (fundId: string) => void;
  onWeightageChange: (fundId: string, weightage: number) => void;
}

export function FundBucket({ funds, onRemoveFund, onWeightageChange }: FundBucketProps) {
  const totalWeightage = funds.reduce((sum, fund) => sum + fund.weightage, 0);
  const isValidAllocation = totalWeightage === 100;

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <Card className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Fund Bucket</h3>
          <p className="text-xs sm:text-sm text-gray-600">
            Manage your selected funds and weightage allocation 
            <span className={`ml-2 font-medium ${funds.length >= 5 ? 'text-red-600' : 'text-blue-600'}`}>
              ({funds.length}/5 funds)
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm text-gray-600">Total Weightage</span>
          <span className={`text-xl sm:text-2xl font-bold ${isValidAllocation ? 'text-green-600' : 'text-red-600'}`}>
            {totalWeightage.toFixed(0)}%
          </span>
        </div>
      </div>

      {funds.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <p className="font-medium">No funds selected</p>
          <p className="text-sm mt-1">Search and add funds to create your portfolio.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fund Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Launch Date</TableHead>
                  <TableHead className="text-center">Weightage (%)</TableHead>
                  <TableHead className="text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {funds.map((fund) => (
                  <TableRow key={fund.id}>
                    <TableCell className="font-medium">
                      {fund.name}
                      <div className="text-xs text-gray-400 mt-1">Code: {fund.id}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {fund.category || 'Unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {formatDate(fund.launchDate)}
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={fund.weightage}
                        onChange={(e) => onWeightageChange(fund.id, parseFloat(e.target.value) || 0)}
                        className="w-24 text-center mx-auto"
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveFund(fund.id)}
                        className="text-gray-400 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {funds.map((fund) => (
              <Card key={fund.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-gray-900 truncate">{fund.name}</h4>
                    <p className="text-xs text-gray-400 mt-0.5">Code: {fund.id}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveFund(fund.id)}
                    className="text-gray-400 hover:text-red-600 hover:bg-red-50 flex-shrink-0 ml-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Category</label>
                    <Badge variant="secondary" className="capitalize text-xs">
                      {fund.category || 'Unknown'}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Launch Date</label>
                    <p className="text-xs text-gray-600">{formatDate(fund.launchDate)}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-gray-500 mb-1 block">Weightage (%)</label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={fund.weightage}
                      onChange={(e) => onWeightageChange(fund.id, parseFloat(e.target.value) || 0)}
                      className="w-full text-center"
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {!isValidAllocation && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ Portfolio allocation must total exactly 100%. Current total: <strong>{totalWeightage}%</strong>
              </p>
            </div>
          )}
        </>
      )}
    </Card>
  );
}