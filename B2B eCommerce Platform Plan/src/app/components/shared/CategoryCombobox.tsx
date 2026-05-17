import { useEffect, useState } from 'react';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '../ui/command';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { adminCategoryApi } from '../../services/adminBackendApi';
import type { Category } from '../../types';

interface CategoryComboboxProps {
  value: string;
  onChange: (value: string, label: string) => void;
  placeholder?: string;
  parentId?: string | null;
  allowCreate?: boolean;
  allowRoot?: boolean;
  excludeId?: string;
}

type CategoryOption = Category & { depth: number };

function flattenCategories(categories: Category[], depth = 0): CategoryOption[] {
  return categories.flatMap(category => [
    { ...category, depth },
    ...flattenCategories(category.children ?? [], depth + 1),
  ]);
}

export function CategoryCombobox({
  value,
  onChange,
  placeholder = 'Chon danh muc...',
  parentId,
  allowCreate = true,
  allowRoot = true,
  excludeId,
}: CategoryComboboxProps) {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');

  useEffect(() => {
    adminCategoryApi.getAll().then(cats => {
      const flat = flattenCategories(cats).filter(cat => cat.id !== excludeId);
      const filtered = parentId !== undefined
        ? flat.filter(cat => cat.parentId === parentId)
        : flat;
      setCategories(filtered);
    });
  }, [excludeId, parentId]);

  const selectedLabel = categories.find(category => category.id === value)?.name ?? '';

  const handleCreate = async () => {
    if (!newCategoryName.trim()) return;
    const newCat = await adminCategoryApi.create({
      name: newCategoryName.trim(),
      parentId: parentId ?? null,
      slug: newCategoryName.trim().toLowerCase().replace(/\s+/g, '-'),
      description: newCategoryDesc.trim(),
      icon: 'Tag',
      isActive: true,
    });
    setCategories(prev => [...prev, { ...newCat, depth: 0 }]);
    onChange(newCat.id, newCat.name);
    setNewCategoryName('');
    setNewCategoryDesc('');
    setShowCreateDialog(false);
    setOpen(false);
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            <span className="truncate">{selectedLabel || placeholder}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full min-w-[280px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Tim danh muc..." />
            <CommandList>
              <CommandEmpty>Khong tim thay danh muc.</CommandEmpty>
              <CommandGroup>
                {allowRoot && (
                  <CommandItem
                    value="root-category"
                    onSelect={() => {
                      onChange('', '');
                      setOpen(false);
                    }}
                  >
                    <Check className={`mr-2 h-4 w-4 ${!value ? 'opacity-100' : 'opacity-0'}`} />
                    <span>Khong co danh muc cha</span>
                  </CommandItem>
                )}
                {categories.map(category => (
                  <CommandItem
                    key={category.id}
                    value={category.name}
                    onSelect={() => {
                      onChange(category.id, category.name);
                      setOpen(false);
                    }}
                  >
                    <Check className={`mr-2 h-4 w-4 ${value === category.id ? 'opacity-100' : 'opacity-0'}`} />
                    <span style={{ paddingLeft: `${category.depth * 16}px` }}>{category.name}</span>
                    <span className="ml-auto text-muted-foreground">{category.productCount}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
              {allowCreate && (
                <>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => {
                        setShowCreateDialog(true);
                        setOpen(false);
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Them danh muc moi
                    </CommandItem>
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Them danh muc moi</DialogTitle>
            <DialogDescription>Tao danh muc moi cho san pham</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Ten danh muc *</Label>
              <Input
                value={newCategoryName}
                onChange={event => setNewCategoryName(event.target.value)}
                placeholder="Nhap ten danh muc..."
              />
            </div>
            <div className="grid gap-2">
              <Label>Mo ta</Label>
              <Input
                value={newCategoryDesc}
                onChange={event => setNewCategoryDesc(event.target.value)}
                placeholder="Nhap mo ta..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Huy</Button>
            <Button onClick={handleCreate} disabled={!newCategoryName.trim()}>Tao moi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
