import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Scenario {
  id: string;
  scenario_type: 'worst' | 'mid' | 'best';
  eps_estimate: number;
  price_target: number;
  probability: number;
}

interface ScenarioChartProps {
  driverId: string;
}

export const ScenarioChart: React.FC<ScenarioChartProps> = ({ driverId }) => {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScenarios();
  }, [driverId]);

  const fetchScenarios = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('scenarios')
        .select('*')
        .eq('driver_id', driverId)
        .order('year', { ascending: true });

      if (error) {
        console.error('Error fetching scenarios:', error);
        toast.error('Failed to load scenario data');
        setScenarios([]);
      } else {
        // Transform scenarios to match the expected format
        const transformedScenarios: Scenario[] = [];
        
        data?.forEach(row => {
          if (row.eps_worst && row.price_worst) {
            transformedScenarios.push({
              id: `${row.id}_worst`,
              scenario_type: 'worst',
              eps_estimate: row.eps_worst,
              price_target: row.price_worst,
              probability: 20
            });
          }
          
          if (row.eps_mid && row.price_mid) {
            transformedScenarios.push({
              id: `${row.id}_mid`,
              scenario_type: 'mid',
              eps_estimate: row.eps_mid,
              price_target: row.price_mid,
              probability: 60
            });
          }
          
          if (row.eps_best && row.price_best) {
            transformedScenarios.push({
              id: `${row.id}_best`,
              scenario_type: 'best',
              eps_estimate: row.eps_best,
              price_target: row.price_best,
              probability: 20
            });
          }
        });
        
        setScenarios(transformedScenarios);
      }
    } catch (error) {
      console.error('Error fetching scenarios:', error);
      toast.error('Failed to load scenario data');
      setScenarios([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-48 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading scenarios...</div>
      </div>
    );
  }

  if (scenarios.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center">
        <p className="text-muted-foreground">No scenario data available</p>
      </div>
    );
  }

  // Sort scenarios by type for consistent display
  const sortedScenarios = scenarios.sort((a, b) => {
    const order = { worst: 0, mid: 1, best: 2 };
    return order[a.scenario_type] - order[b.scenario_type];
  });

  // Prepare data for the chart
  const chartData = sortedScenarios.map((scenario, index) => ({
    scenario: scenario.scenario_type,
    eps: scenario.eps_estimate,
    price: scenario.price_target,
    probability: scenario.probability,
    index: index
  }));

  const getScenarioColor = (type: string) => {
    switch (type) {
      case 'worst': return '#ef4444';
      case 'mid': return '#f59e0b';
      case 'best': return '#10b981';
      default: return '#6b7280';
    }
  };

  return (
    <div>
      <h5 className="font-medium mb-3">Price vs EPS Scenarios</h5>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="scenario" 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
            />
            <YAxis 
              yAxisId="price"
              orientation="left"
              tick={{ fontSize: 12 }}
              label={{ value: 'Price ($)', angle: -90, position: 'insideLeft' }}
            />
            <YAxis 
              yAxisId="eps"
              orientation="right"
              tick={{ fontSize: 12 }}
              label={{ value: 'EPS ($)', angle: 90, position: 'insideRight' }}
            />
            <Tooltip 
              formatter={(value, name) => [
                `$${value}`,
                name === 'price' ? 'Price Target' : 'EPS Estimate'
              ]}
              labelFormatter={(label) => `${label.charAt(0).toUpperCase() + label.slice(1)} Case`}
            />
            <Line
              yAxisId="price"
              type="monotone"
              dataKey="price"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              name="price"
            />
            <Line
              yAxisId="eps"
              type="monotone"
              dataKey="eps"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
              name="eps"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Scenario details */}
      <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
        {sortedScenarios.map((scenario) => (
          <div 
            key={scenario.id} 
            className="text-center p-2 rounded border"
            style={{ borderColor: getScenarioColor(scenario.scenario_type) }}
          >
            <div className="font-medium" style={{ color: getScenarioColor(scenario.scenario_type) }}>
              {scenario.scenario_type.toUpperCase()}
            </div>
            <div>EPS: ${scenario.eps_estimate}</div>
            <div>Price: ${scenario.price_target}</div>
            <div>{scenario.probability}% prob</div>
          </div>
        ))}
      </div>
    </div>
  );
};