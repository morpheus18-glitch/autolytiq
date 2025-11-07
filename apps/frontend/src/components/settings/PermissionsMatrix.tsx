import { Fragment, useMemo } from 'react';
import { Checkbox } from '@repo/ui';
import { cn } from '@/lib/utils';

export interface PermissionDefinition {
  id: string;
  label: string;
  description?: string;
}

export type PermissionMatrixValues = Record<string, Record<string, boolean>>;

export interface PermissionsMatrixProps {
  permissions: PermissionDefinition[];
  roles: string[];
  values: PermissionMatrixValues;
  onChange: (permissionId: string, role: string, value: boolean) => void;
  className?: string;
  disabled?: boolean;
}

export function PermissionsMatrix({
  permissions,
  roles,
  values,
  onChange,
  className,
  disabled = false,
}: PermissionsMatrixProps): JSX.Element {
  const normalizedValues = useMemo(() => values ?? {}, [values]);

  return (
    <div className={cn('overflow-x-auto rounded border border-border', className)}>
      <table className="min-w-full divide-y divide-border text-left text-sm">
        <thead className="bg-muted/70">
          <tr>
            <th scope="col" className="px-4 py-3 font-semibold text-muted-foreground">
              Permission
            </th>
            {roles.map((role) => (
              <th key={role} scope="col" className="px-4 py-3 text-center font-semibold text-muted-foreground">
                {role}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-card/40">
          {permissions.map((permission) => (
            <Fragment key={permission.id}>
              <tr>
                <td className="px-4 py-3 align-top">
                  <div className="font-medium text-foreground">{permission.label}</div>
                  {permission.description ? (
                    <p className="text-xs text-muted-foreground">{permission.description}</p>
                  ) : null}
                </td>
                {roles.map((role) => {
                  const checked = normalizedValues[permission.id]?.[role] ?? false;
                  return (
                    <td key={role} className="px-4 py-3 text-center">
                      <Checkbox
                        checked={checked}
                        disabled={disabled}
                        onCheckedChange={(next) => onChange(permission.id, role, next === true)}
                        aria-label={`${permission.label} permission for ${role}`}
                      />
                    </td>
                  );
                })}
              </tr>
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PermissionsMatrix;
