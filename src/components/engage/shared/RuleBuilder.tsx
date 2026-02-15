import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';

export interface Rule {
  field: string;
  operator: string;
  value: string;
}

interface RuleBuilderProps {
  rules: Rule[];
  onChange: (rules: Rule[]) => void;
  fields?: { value: string; label: string }[];
}

const defaultFields = [
  { value: 'email', label: 'Email' },
  { value: 'first_name', label: 'First Name' },
  { value: 'last_name', label: 'Last Name' },
  { value: 'tags', label: 'Tags' },
  { value: 'created_at', label: 'Created At' },
];

const operators = [
  { value: 'equals', label: 'equals' },
  { value: 'not_equals', label: 'not equals' },
  { value: 'contains', label: 'contains' },
  { value: 'gt', label: 'greater than' },
  { value: 'lt', label: 'less than' },
  { value: 'includes', label: 'includes' },
];

export const RuleBuilder = ({ rules, onChange, fields = defaultFields }: RuleBuilderProps) => {
  const addRule = () => onChange([...rules, { field: fields[0]?.value || '', operator: 'equals', value: '' }]);
  const removeRule = (i: number) => onChange(rules.filter((_, idx) => idx !== i));
  const updateRule = (i: number, partial: Partial<Rule>) => {
    const updated = [...rules];
    updated[i] = { ...updated[i], ...partial };
    onChange(updated);
  };

  return (
    <div className="space-y-2">
      {rules.map((rule, i) => (
        <div key={i} className="flex items-center gap-2">
          <Select value={rule.field} onValueChange={v => updateRule(i, { field: v })}>
            <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {fields.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={rule.operator} onValueChange={v => updateRule(i, { operator: v })}>
            <SelectTrigger className="w-24 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {operators.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input
            value={rule.value}
            onChange={e => updateRule(i, { value: e.target.value })}
            className="h-8 text-xs flex-1"
            placeholder="Value"
          />
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => removeRule(i)}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" className="h-7 text-xs" onClick={addRule}>
        <Plus className="h-3 w-3 mr-1" /> Add Rule
      </Button>
    </div>
  );
};
