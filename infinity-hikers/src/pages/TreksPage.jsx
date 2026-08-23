import DestinationsPage from "./DestinationsPage";

// Same browse experience as Tours (search, filters, cards, quick view) —
// just scoped to category: "trek". See DestinationsPage for the shared logic.
export default function TreksPage() {
  return <DestinationsPage category="trek" />;
}
