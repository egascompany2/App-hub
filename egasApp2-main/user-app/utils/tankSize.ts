import { TankSize } from "@/services/tankSize";

export const getTankSizePrice = (tankSizes: TankSize[], selectedSize: string | undefined | null) => {
  if (!selectedSize || !tankSizes.length) return 0;
  
  const tankSize = tankSizes.find(size => size.size === selectedSize);
  return tankSize?.price || 0;
}; 