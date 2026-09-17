import { NotFoundView } from "@/components/not-found-view";

export default function PaintingNotFound() {
  return (
    <NotFoundView
      heading="Painting not found"
      message="This painting is not part of the collection, or it has been taken down."
      back={{ href: "/paintings", label: "All paintings" }}
    />
  );
}
