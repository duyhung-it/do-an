import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '../ui/command';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { categoryApi } from '../../services/api';
import type { Category } from '../../types';

interface CategoryComboboxProps {
  value: string;
  onChange: (value: string, label: string) => void;
  placeholder?: string;
  parentId?: string | null;
  allowCreate?: boolean;
}

export function CategoryCombobox({
  value,
  onChange,
  placeholder = 'Chọn danh mục...',
  parentId = null,
  allowCreate = true,
}: CategoryComboboxProps) {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');

  useEffect(() => {
    categoryApi.getAll().then(cats => {
      const filtered = parentId !== undefined
        ? cats.filter(c => c.parentId === parentId)
        : cats;
      setCategories(filtered);
    });
  }, [parentId]);

  const selectedLabel = categories.find(c => c.id === value)?.name ?? '';

  const handleCreate = async () => {
    if (!newCategoryName.trim()) return;
    const newCat = await categoryApi.create({
      name: newCategoryName.trim(),
      parentId: parentId ?? null,
      slug: newCategoryName.trim().toLowerCase().replace(/\s+/g, '-'),
      description: newCategoryDesc.trim(),
      icon: 'Tag',
      isActive: true,
    });
    setCategories(prev => [...prev, newCat]);
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
            <CommandInput placeholder="Tìm danh mục..." />
            <CommandList>
              <CommandEmpty>Không tìm thấy danh mục.</CommandEmpty>
              <CommandGroup>
                {categories.map(cat => (
                  <CommandItem
                    key={cat.id}
                    value={cat.name}
                    onSelect={() => {
                      onChange(cat.id, cat.name);
                      setOpen(false);
                    }}
                  >
                    <Check className={`mr-2 h-4 w-4 ${value === cat.id ? 'opacity-100' : 'opacity-0'}`} />
                    <span>{cat.name}</span>
                    <span className="ml-auto text-muted-foreground">{cat.productCount}</span>
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
                      Thêm danh mục mới
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
            <DialogTitle>Thêm danh mục mới</DialogTitle>
            <DialogDescription>Tạo danh mục mới cho sản phẩm</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Tên danh mục *</Label>
              <Input
                value={newCategoryName}
                onChange={e => setNewCategoryName(e.target.value)}
                placeholder="Nhập tên danh mục..."
              />
            </div>
            <div className="grid gap-2">
              <Label>Mô tả</Label>
              <Input
                value={newCategoryDesc}
                onChange={e => setNewCategoryDesc(e.target.value)}
                placeholder="Nhập mô tả..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Huỷ</Button>
            <Button onClick={handleCreate} disabled={!newCategoryName.trim()}>Tạo mới</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}