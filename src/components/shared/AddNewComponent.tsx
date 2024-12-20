import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Plus } from 'lucide-react'
import { FC, useRef } from 'react'

interface IAddNewComponentProps {
  placeholder: string
  disabled?: boolean
  callback(label: string): boolean
}

const AddNewComponent: FC<IAddNewComponentProps> = ({
  placeholder,
  disabled = false,
  callback,
}) => {
  const InputRef = useRef<HTMLInputElement>(null)

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ): void => {
    if (event.key === 'Enter') {
      event.preventDefault()
      if (InputRef.current && InputRef.current.value !== '') {
        const success = callback(InputRef.current.value)
        if (success) InputRef.current.value = ''
      }
    }
  }

  return (
    <div
      className={cn(
        'relative flex min-h-11 w-full items-center gap-[0.69rem] rounded-[0.875rem] border border-dashed border-neutral-200 bg-neutral-0 py-3 pl-5 pr-3',
        disabled ? 'cursor-not-allowed' : 'cursor-pointer',
      )}
    >
      <Plus size="18" className="text-neutral-600" />
      <Input
        ref={InputRef}
        disabled={disabled}
        placeholder={placeholder}
        onKeyDown={handleKeyDown}
        className="m-0 h-fit rounded-none border-0 p-0 text-xs text-neutral-600"
      />
    </div>
  )
}

export default AddNewComponent
