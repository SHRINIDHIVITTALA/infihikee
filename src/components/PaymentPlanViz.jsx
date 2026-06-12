import { motion } from "framer-motion";
import "./PaymentPlanViz.css";

function deriveSteps(price, customPlan) {
  if (customPlan) return customPlan;
  const p1 = Math.round(price * 0.30);
  const p2 = Math.round(price * 0.40);
  const p3 = price - p1 - p2;
  return [
    { label: "On Booking", amount: p1, when: "Today" },
    { label: "2nd Payment", amount: p2, when: "45 days before" },
    { label: "Final Payment", amount: p3, when: "25 days before" },
  ];
}

export default function PaymentPlanViz({ price, customPlan }) {
  const steps = deriveSteps(price, customPlan);
  const fmt = (n) => `₹${n.toLocaleString("en-IN")}`;

  return (
    <div className="pplan">
      <h4 className="pplan__title">💳 Easy Payment Plan</h4>
      <div className="pplan__steps">
        {steps.map((step, i) => (
          <div key={i} className="pplan__step">
            <motion.div
              className="pplan__bubble"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.12, type: "spring", stiffness: 300 }}
            >
              {i + 1}
            </motion.div>
            {i < steps.length - 1 && <div className="pplan__line" />}
            <div className="pplan__info">
              <span className="pplan__amount">{fmt(step.amount)}</span>
              <span className="pplan__label">{step.label}</span>
              <span className="pplan__when">{step.when}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
