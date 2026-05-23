// ============================================================
// AvatarGroup — Hiển thị nhiều avatar chồng lên nhau
// A4.07: Dùng cho team, cửa hàng, participants
// ============================================================

import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

interface AvatarItem {
  name: string;
  image?: string;
}

interface AvatarGroupProps {
  items: AvatarItem[];
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'h-6 w-6 text-[10px]',
  md: 'h-8 w-8 text-xs',
  lg: 'h-10 w-10 text-sm',
};

const getInitials = (name: string) =>
  name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

export function AvatarGroup({ items, max = 5, size = 'md', className = '' }: AvatarGroupProps) {
  const visible = items.slice(0, max);
  const remaining = items.length - max;
  const sizeClass = sizeMap[size];

  return (
    <TooltipProvider>
      <div className={`flex items-center -space-x-2 ${className}`}>
        {visible.map((item, i) => (
          <Tooltip key={i}>
            <TooltipTrigger asChild>
              <Avatar className={`${sizeClass} border-2 border-background ring-0`}>
                {item.image && <AvatarImage src={item.image} alt={item.name} />}
                <AvatarFallback className="text-[inherit]">{getInitials(item.name)}</AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>{item.name}</p>
            </TooltipContent>
          </Tooltip>
        ))}
        {remaining > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Avatar className={`${sizeClass} border-2 border-background ring-0`}>
                <AvatarFallback className="bg-muted text-muted-foreground text-[inherit]">
                  +{remaining}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>và {remaining} người khác</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}
