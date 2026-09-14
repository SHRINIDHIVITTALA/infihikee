import DestinationsPage from "./DestinationsPage";

// Same browse experience as Tours (search, filters, cards, quick view) —
// just scoped to category: "pilgrimage". See DestinationsPage for the shared logic.
export default function PilgrimagesPage() {
  return <DestinationsPage category="pilgrimage" />;
}
