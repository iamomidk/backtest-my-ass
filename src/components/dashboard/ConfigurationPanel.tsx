import React, { useState } from 'react'
import { Settings, Save, RefreshCw } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { Configuration } from '../../hooks/useBacktestData'

interface ConfigurationPanelProps {
  configurations: Configuration[]
  onRefresh: () => Promise<void>
}

export function ConfigurationPanel({ configurations, onRefresh }: ConfigurationPanelProps) {
  const [editingConfig, setEditingConfig] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Configuration>>({})
  const [saving, setSaving] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const handleEdit = (config: Configuration) => {
    setEditingConfig(config.symbol)
    setFormData(config)
  }

  const handleSave = async () => {
    setSaving(true)
    // In a real app, this would save to the database
    console.log('Saving configuration:', formData)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setEditingConfig(null)
    setFormData({})
    setSaving(false)
  }

  const handleCancel = () => {
    setEditingConfig(null)
    setFormData({})
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await onRefresh()
    } finally {
      setRefreshing(false)
    }
  }
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-gray-600" />
            <CardTitle>Trading Configurations</CardTitle>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            loading={refreshing}
            disabled={refreshing}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {configurations.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No configurations found
          </div>
        ) : (
        <div className="space-y-4">
          {configurations.map((config) => (
            <div key={config.symbol} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <h4 className="font-semibold text-lg text-gray-900 dark:text-white">{config.symbol}</h4>
                  <Badge variant={config.is_active ? 'success' : 'error'} size="sm">
                    {config.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  <Badge variant="info" size="sm">
                    {config.status}
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(config)}
                  disabled={editingConfig === config.symbol}
                >
                  Edit
                </Button>
              </div>

              {editingConfig === config.symbol ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Risk per Trade (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.risk_per_trade_percent || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        risk_per_trade_percent: parseFloat(e.target.value)
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      ATR Min
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.atr_min || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        atr_min: parseFloat(e.target.value)
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      ATR Max
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.atr_max || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        atr_max: parseFloat(e.target.value)
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        status: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="active">Active</option>
                      <option value="paused">Paused</option>
                      <option value="disabled">Disabled</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={formData.notes || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        notes: e.target.value
                      })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2 flex justify-end space-x-2">
                    <Button variant="outline" size="sm" onClick={handleCancel}>
                      Cancel
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={handleSave}
                      loading={saving}
                      disabled={saving}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Risk per Trade:</span>
                    <p className="font-medium text-gray-900 dark:text-white">{config.risk_per_trade_percent}%</p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">ATR Range:</span>
                    <p className="font-medium text-gray-900 dark:text-white">{config.atr_min} - {config.atr_max}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Cooldown:</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {config.cooldown_until ? 'Active' : 'None'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Notes:</span>
                    <p className="font-medium text-xs truncate text-gray-900 dark:text-white">
                      {config.notes || 'No notes'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        )}
      </CardContent>
    </Card>
  )
}