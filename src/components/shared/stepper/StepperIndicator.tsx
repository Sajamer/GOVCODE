interface Step {
  id: string
  title: string
  description: string
}

interface StepperIndicatorProps {
  steps: Step[]
  currentStep: number
  onStepClick?: (index: number) => void
}

const StepperIndicator = ({
  steps,
  currentStep,
  onStepClick,
}: StepperIndicatorProps) => {
  return (
    <div className="w-full">
      <div className="relative flex justify-between">
        {steps.map((step, index) => {
          const isActive = currentStep === index
          const isCompleted = currentStep > index
          const isClickable =
            onStepClick && (isCompleted || index === currentStep - 1)

          return (
            <div
              key={step.id}
              className="relative flex flex-col items-center"
              onClick={() => isClickable && onStepClick(index)}
            >
              <div
                className={`z-10 flex size-8 items-center justify-center rounded-full border-2 
                ${
                  isActive
                    ? 'border-primary bg-primary text-white'
                    : isCompleted
                      ? 'border-primary bg-primary text-white'
                      : 'border-gray-300 bg-white'
                }
                ${isClickable ? 'cursor-pointer' : ''}`}
              >
                {isCompleted ? (
                  <svg
                    className="size-4 text-white"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className={isActive ? 'text-white' : 'text-gray-500'}>
                    {index + 1}
                  </span>
                )}
              </div>
              <div className="mt-2 text-center">
                <div
                  className={`text-sm font-medium ${
                    isActive || isCompleted ? 'text-primary' : 'text-gray-500'
                  }`}
                >
                  {step.title}
                </div>
                <div className="text-xs text-gray-400">{step.description}</div>
              </div>
            </div>
          )
        })}
        <div className="absolute top-4 -z-10 h-[2px] w-full">
          <div className="size-full bg-gray-200">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{
                width: `${(currentStep / (steps.length - 1)) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default StepperIndicator
