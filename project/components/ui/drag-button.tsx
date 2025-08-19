import { DraggableAttributes } from "@dnd-kit/core";
import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { GripVertical } from "lucide-react";

type Props = {
  listeners: SyntheticListenerMap | undefined;
  attributes: DraggableAttributes;
  iconSize?: number;
};

function DragButton({ listeners, attributes, iconSize }: Props) {
  return (
    <button
      {...listeners}
      {...attributes}
      className="touch-none p-1 text-secondary-foreground/50 hover:bg-foreground/10 hover:text-foreground active:bg-foreground/10 active:text-foreground rounded-md cursor-grab transition-all"
    >
      <GripVertical size={iconSize} />
    </button>
  );
}

export { DragButton };
