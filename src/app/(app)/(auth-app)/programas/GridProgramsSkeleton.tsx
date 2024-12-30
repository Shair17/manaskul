import { Skeleton } from "@/components/ui/skeleton";
import { generateArray } from "@/lib/utils";

export const GridProgramsSkeleton: React.FC = () => {
  const randomArray = generateArray(24);

  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
      {randomArray.map((_, key) => (
        <Skeleton key={key} className="h-[370px] rounded-lg shadow-sm" />
      ))}
    </div>
  );
};
