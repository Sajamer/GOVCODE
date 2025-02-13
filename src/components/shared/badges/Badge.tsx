import { GenericBadge, IBadgeProps, badgeVariants } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { Lock1, Unlock } from 'iconsax-react'
import { Plus } from 'lucide-react'

const Badge = ({
  variant,
  size,
  hasIcon,
  hasAvatar,
  canBeClosed,
  onClose,
  className,
  children,
  isLock,
}: IBadgeProps): JSX.Element => {
  return (
    <GenericBadge
      variant={variant}
      size={size}
      hasIcon={hasIcon}
      hasAvatar={hasAvatar}
      canBeClosed={canBeClosed}
      className={cn(badgeVariants({ variant, size }), className)}
    >
      {isLock ? (
        <>
          {isLock === 'true' ? (
            <>
              <Lock1
                variant="Bulk"
                className="min-h-3.5 min-w-3.5 pl-[0.38rem] text-destructive"
              />
              <Label className="pr-[0.38rem] text-[0.75rem] font-medium text-destructive">
                Locked
              </Label>
            </>
          ) : (
            <>
              <Unlock
                variant="Linear"
                className="min-h-3.5 min-w-3.5 pl-[0.38rem] text-success"
              />
              <Label className="pr-[0.38rem] text-[0.75rem] font-medium text-success">
                Unlocked
              </Label>
            </>
          )}
        </>
      ) : (
        <>
          {children}
          {canBeClosed && (
            <div
              className="relative flex size-[1.125rem] cursor-pointer items-center justify-center"
              onClick={onClose}
            >
              <div className="absolute inset-0 rounded-full bg-current opacity-45"></div>
              <div className="relative">
                <Plus className="size-3 rotate-45" />
              </div>
            </div>
          )}
        </>
      )}
    </GenericBadge>
  )
}

export default Badge
