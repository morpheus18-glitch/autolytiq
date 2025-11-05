import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn.js';
import { Check } from 'lucide-react';

/**
 * Stepper component
 * Multi-step progress indicator for wizards and forms
 */

const stepperVariants = cva('flex', {
  variants: {
    orientation: {
      horizontal: 'flex-row items-center',
      vertical: 'flex-col',
    },
    variant: {
      default: '',
      pills: '',
      dots: '',
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
    variant: 'default',
  },
});

export interface Step {
  id: string;
  label: string;
  description?: string;
  optional?: boolean;
  icon?: React.ReactNode;
}

export interface StepperProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof stepperVariants> {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
  clickable?: boolean;
}

export const Stepper = React.forwardRef<HTMLDivElement, StepperProps>(
  (
    {
      className,
      orientation,
      variant,
      steps,
      currentStep,
      onStepClick,
      clickable = false,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(stepperVariants({ orientation, variant }), className)}
        role="navigation"
        aria-label="Progress"
        {...props}
      >
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isUpcoming = index > currentStep;

          return (
            <React.Fragment key={step.id}>
              <StepItem
                step={step}
                index={index}
                isCompleted={isCompleted}
                isCurrent={isCurrent}
                isUpcoming={isUpcoming}
                clickable={clickable && index <= currentStep}
                onClick={() => clickable && index <= currentStep && onStepClick?.(index)}
                orientation={orientation || 'horizontal'}
                variant={variant || 'default'}
              />
              {index < steps.length - 1 && (
                <StepConnector
                  isCompleted={isCompleted}
                  orientation={orientation || 'horizontal'}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  }
);

Stepper.displayName = 'Stepper';

/**
 * StepItem component
 */
interface StepItemProps {
  step: Step;
  index: number;
  isCompleted: boolean;
  isCurrent: boolean;
  isUpcoming: boolean;
  clickable: boolean;
  onClick: () => void;
  orientation: 'horizontal' | 'vertical';
  variant: 'default' | 'pills' | 'dots';
}

const StepItem: React.FC<StepItemProps> = ({
  step,
  index,
  isCompleted,
  isCurrent,
  isUpcoming,
  clickable,
  onClick,
  orientation,
  variant,
}) => {
  const Element = clickable ? 'button' : 'div';

  return (
    <Element
      className={cn(
        'flex items-center gap-3',
        orientation === 'vertical' && 'w-full',
        clickable && 'cursor-pointer hover:opacity-80 transition-opacity'
      )}
      onClick={clickable ? onClick : undefined}
      aria-current={isCurrent ? 'step' : undefined}
      type={clickable ? 'button' : undefined}
    >
      {/* Step indicator */}
      <div
        className={cn(
          'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all',
          variant === 'pills' && 'rounded-lg',
          variant === 'dots' && 'h-3 w-3',
          isCompleted &&
            'border-primary-600 bg-primary-600 text-white',
          isCurrent &&
            'border-primary-600 bg-white text-primary-600',
          isUpcoming &&
            'border-gray-300 bg-white text-gray-400'
        )}
      >
        {variant !== 'dots' && (
          <>
            {isCompleted ? (
              <Check className="h-5 w-5" />
            ) : step.icon ? (
              step.icon
            ) : (
              <span className="text-sm font-semibold">{index + 1}</span>
            )}
          </>
        )}
      </div>

      {/* Step label */}
      {variant !== 'dots' && (
        <div
          className={cn(
            'flex flex-col',
            orientation === 'horizontal' && 'min-w-0'
          )}
        >
          <span
            className={cn(
              'text-sm font-medium',
              isCurrent && 'text-primary-600',
              isCompleted && 'text-gray-900',
              isUpcoming && 'text-gray-500'
            )}
          >
            {step.label}
          </span>
          {step.description && (
            <span className="text-xs text-gray-500">{step.description}</span>
          )}
          {step.optional && (
            <span className="text-xs text-gray-400">Optional</span>
          )}
        </div>
      )}
    </Element>
  );
};

/**
 * StepConnector component
 */
interface StepConnectorProps {
  isCompleted: boolean;
  orientation: 'horizontal' | 'vertical';
}

const StepConnector: React.FC<StepConnectorProps> = ({
  isCompleted,
  orientation,
}) => {
  return (
    <div
      className={cn(
        'transition-colors',
        orientation === 'horizontal'
          ? 'h-0.5 flex-1 mx-2'
          : 'w-0.5 h-8 ml-5',
        isCompleted ? 'bg-primary-600' : 'bg-gray-300'
      )}
    />
  );
};
