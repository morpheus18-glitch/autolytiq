/**
 * @repo/ui - AutolytiQ Component Library
 * A comprehensive React component library built on design tokens
 */

// Components
export { Button, buttonVariants, type ButtonProps } from './components/Button.js';
export { Input, inputVariants, type InputProps } from './components/Input.js';
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  cardVariants,
  type CardProps,
} from './components/Card.js';

// Utilities
export { cn } from './utils/cn.js';

// Import styles (consumers should import this in their app)
export const styles = '@repo/ui/styles.css';
