import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { ABTestVariant } from '@/components/ab-testing/ABTestVariant';
import { cn } from '@/lib/utils';

interface ABTestButtonVariant {
  text: string;
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
  className?: string;
  onClick?: () => void;
}

interface ABTestButtonProps extends Omit<ButtonProps, 'onClick' | 'variant' | 'size'> {
  testId: string;
  variants: Record<string, ABTestButtonVariant>;
  fallback?: ABTestButtonVariant;
  trackClick?: boolean;
  onVariantClick?: (variantName: string, variant: ABTestButtonVariant) => void;
}

export const ABTestButton: React.FC<ABTestButtonProps> = ({
  testId,
  variants,
  fallback = { text: 'Default Button' },
  trackClick = true,
  onVariantClick,
  className,
  ...props
}) => {
  const handleVariantClick = (variantName: string) => {
    const variant = variants[variantName];
    if (variant) {
      onVariantClick?.(variantName, variant);
      variant.onClick?.();
    }
  };

  const variantComponents = Object.entries(variants).reduce((acc, [key, variant]) => {
    acc[key] = (
      <Button
        key={key}
        variant={variant.variant}
        size={variant.size}
        className={cn(className, variant.className)}
        onClick={() => handleVariantClick(key)}
        {...props}
      >
        {variant.text}
      </Button>
    );
    return acc;
  }, {} as Record<string, React.ReactNode>);

  const fallbackComponent = (
    <Button
      variant={fallback.variant}
      size={fallback.size}
      className={cn(className, fallback.className)}
      onClick={() => fallback.onClick?.()}
      {...props}
    >
      {fallback.text}
    </Button>
  );

  return (
    <ABTestVariant
      testId={testId}
      variants={variantComponents}
      fallback={fallbackComponent}
      autoTrack={trackClick}
      onVariantAssigned={(variantName) => {
        // Track variant assignment if needed
        console.log(`Button variant assigned: ${variantName}`);
      }}
    />
  );
};

// Convenience component for simple text variations
interface ABTestButtonTextProps extends Omit<ButtonProps, 'children'> {
  testId: string;
  textVariants: Record<string, string>;
  fallbackText?: string;
  trackClick?: boolean;
}

export const ABTestButtonText: React.FC<ABTestButtonTextProps> = ({
  testId,
  textVariants,
  fallbackText = 'Default Button',
  trackClick = true,
  ...props
}) => {
  const variants = Object.entries(textVariants).reduce((acc, [key, text]) => {
    acc[key] = (
      <Button key={key} {...props}>
        {text}
      </Button>
    );
    return acc;
  }, {} as Record<string, React.ReactNode>);

  const fallback = (
    <Button {...props}>
      {fallbackText}
    </Button>
  );

  return (
    <ABTestVariant
      testId={testId}
      variants={variants}
      fallback={fallback}
      autoTrack={trackClick}
    />
  );
};