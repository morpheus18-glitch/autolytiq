import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui';
import { Badge } from '@repo/ui';
import { Button } from '@repo/ui';
import { Check, Shield, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface RolePreset {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
  isActive: boolean;
}

export interface RolePresetCardProps {
  preset: RolePreset;
  isSelected?: boolean;
  onSelect?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  permissionCount?: number;
  className?: string;
}

export function RolePresetCard({
  preset,
  isSelected = false,
  onSelect,
  onEdit,
  onDelete,
  permissionCount,
  className,
}: RolePresetCardProps) {
  const displayPermissionCount = permissionCount ?? preset.permissions.length;

  return (
    <Card
      className={cn(
        'relative transition-all duration-200 cursor-pointer',
        isSelected && 'ring-2 ring-primary shadow-lg',
        !preset.isActive && 'opacity-60',
        className
      )}
      onClick={onSelect}
    >
      {isSelected && (
        <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-primary flex items-center justify-center shadow-md">
          <Check className="h-4 w-4 text-white" />
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              {preset.isSystem ? (
                <Shield className="h-5 w-5 text-primary" />
              ) : (
                <Users className="h-5 w-5 text-primary" />
              )}
            </div>
            <div className="min-w-0">
              <CardTitle className="text-lg truncate">{preset.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                {preset.isSystem && (
                  <Badge variant="secondary" className="text-xs">
                    System
                  </Badge>
                )}
                {!preset.isActive && (
                  <Badge variant="destructive" className="text-xs">
                    Inactive
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <CardDescription className="text-sm line-clamp-2">{preset.description}</CardDescription>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="outline" className="text-xs font-normal">
            {displayPermissionCount} {displayPermissionCount === 1 ? 'permission' : 'permissions'}
          </Badge>
        </div>

        {(onEdit || onDelete) && (
          <div className="flex items-center gap-2 pt-2">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
              >
                Edit
              </Button>
            )}
            {onDelete && !preset.isSystem && (
              <Button
                variant="destructive"
                size="sm"
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                Delete
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
