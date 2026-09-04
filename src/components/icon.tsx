import {
  Bike,
  Car,
  CarFront,
  CircleDot,
  Cog,
  Filter,
  Lightbulb,
  Package,
  Thermometer,
  Truck,
  Wind,
  Wrench,
  Zap,
  Disc3,
  Waves,
  type LucideProps,
} from "lucide-react";

const MAP: Record<string, React.ComponentType<LucideProps>> = {
  car: Car,
  bike: Bike,
  truck: Truck,
  engine: Cog,
  brake: Disc3,
  suspension: Waves,
  zap: Zap,
  filter: Filter,
  "circle-dot": CircleDot,
  cog: Cog,
  "car-front": CarFront,
  lightbulb: Lightbulb,
  thermometer: Thermometer,
  wind: Wind,
  package: Package,
  wrench: Wrench,
};

export function Icon({ name, ...props }: { name: string } & LucideProps) {
  const C = MAP[name] ?? Wrench;
  return <C {...props} />;
}
