import { NotFoundView } from "@/components/not-found-view";

export default function NotFound() {
  return (
    <NotFoundView
      heading="This room is empty"
      message="The page you are looking for was moved, sold or never hung."
      back={{ href: "/", label: "Back to the entrance" }}
    />
  );
}
