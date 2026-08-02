import "./MarqueeTicker.css";

const ITEMS = [
  "SRI LANKA",
  "SRI LANKA",
  "BALI",
  "MAKE MEMORIES",
  "GO FURTHER",
  "ADVENTURE AWAITS",
  "LIFE IS SHORT",
  "SRI LANKA",
  "SRI LANKA",
  "BALI",
  "MAKE MEMORIES",
  "GO FURTHER",
  "ADVENTURE AWAITS",
  "LIFE IS SHORT",
];

export default function MarqueeTicker() {
  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker__track">
        <div className="ticker__content">
          {ITEMS.map((item, i) => (
            <span key={i} className="ticker__item">
              {item}
              <span className="ticker__dot">✦</span>
            </span>
          ))}
        </div>
        <div className="ticker__content" aria-hidden="true">
          {ITEMS.map((item, i) => (
            <span key={`dup-${i}`} className="ticker__item">
              {item}
              <span className="ticker__dot">✦</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
