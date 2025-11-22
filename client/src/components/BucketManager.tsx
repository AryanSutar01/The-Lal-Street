import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Plus, Trash2, Eye, TrendingUp } from 'lucide-react';
import type { Bucket } from '../types/bucket';
import type { SelectedFund } from '../App';

interface BucketManagerProps {
  buckets: Bucket[];
  onCreateBucket: (name: string, funds: SelectedFund[]) => void;
  onDeleteBucket: (bucketId: string) => void;
  onViewPerformance: (bucketId: string) => void;
  availableFunds: SelectedFund[];
  onAddFundsToBucket?: (bucketId: string, funds: SelectedFund[]) => void;
}

export function BucketManager({
  buckets,
  onCreateBucket,
  onDeleteBucket,
  onViewPerformance,
  availableFunds,
  onAddFundsToBucket,
}: BucketManagerProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newBucketName, setNewBucketName] = useState('');

  const handleCreateBucket = () => {
    if (newBucketName.trim() && availableFunds.length >= 2) {
      onCreateBucket(newBucketName.trim(), availableFunds);
      setNewBucketName('');
      setIsCreateDialogOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">SWP Buckets</h3>
          <p className="text-sm text-gray-600">Manage your withdrawal plan buckets</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Bucket
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Bucket</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="bucket-name">Bucket Name</Label>
                <Input
                  id="bucket-name"
                  value={newBucketName}
                  onChange={(e) => setNewBucketName(e.target.value)}
                  placeholder="e.g., Retirement Bucket 1"
                />
              </div>
              <div>
                <Label>Available Funds ({availableFunds.length})</Label>
                <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
                  {availableFunds.map((fund) => (
                    <div key={fund.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <p className="text-sm font-medium">{fund.name}</p>
                        <p className="text-xs text-gray-500">Weightage: {fund.weightage}%</p>
                      </div>
                      <Badge variant="secondary">{fund.category}</Badge>
                    </div>
                  ))}
                </div>
              </div>
              {availableFunds.length < 2 && (
                <p className="text-sm text-yellow-600">
                  ⚠️ You need at least 2 funds in your portfolio to create a bucket.
                </p>
              )}
              <Button onClick={handleCreateBucket} disabled={!newBucketName.trim() || availableFunds.length < 2}>
                Create Bucket
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {buckets.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <TrendingUp className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 mb-4">No buckets created yet</p>
          <p className="text-sm text-gray-500">Create a bucket to manage your SWP plans</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {buckets.map((bucket) => (
            <Card key={bucket.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{bucket.name}</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    {bucket.funds.length} fund{bucket.funds.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteBucket(bucket.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-2 mb-4">
                {bucket.funds.slice(0, 3).map((fund) => (
                  <div key={fund.id} className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 truncate flex-1">{fund.name}</span>
                    <Badge variant="outline" className="ml-2">{fund.weightage}%</Badge>
                  </div>
                ))}
                {bucket.funds.length > 3 && (
                  <p className="text-xs text-gray-500">+{bucket.funds.length - 3} more</p>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => onViewPerformance(bucket.id)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Performance
                </Button>
                {onAddFundsToBucket && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAddFundsToBucket?.(bucket.id, availableFunds)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

