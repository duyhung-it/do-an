import { LayoutGrid, List, Table2 } from 'lucide-react';
import { Button } from '../ui/button';
import type { ViewMode } from '../../types';

interface ViewToggleProps {
  viewMode: ViewMode;
  onChange: (mode: ViewMode) => void;
  modes?: ViewMode[];
}

const iconMap: Record<ViewMode, React.ReactNode> = {
  grid: <LayoutGrid className="h-4 w-4" />,
  list: <List className="h-4 w-4" />,
  table: <Table2 className="h-4 w-4" />,
};

const labelMap: Record<ViewMode, string> = {
  grid: 'Lưới',
  list: 'Danh sách',
  table: 'Bảng',
};

export function ViewToggle({ viewMode, onChange, modes = ['table', 'grid', 'list'] }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-1 rounded-lg border p-1">
      {modes.map(mode => (
        <Button
          key={mode}
          variant={viewMode === mode ? 'default' : 'ghost'}
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onChange(mode)}
          title={labelMap[mode]}
        >
          {iconMap[mode]}
        </Button>
      ))}
    </div>
  );
}
