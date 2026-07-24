import { CartIcon } from "@/shared/ui/Icons";

interface BuyFabProps {
  isMobile: boolean;
  onClick: () => void;
}

export default function BuyFab({ isMobile, onClick }: BuyFabProps) {
  const triggerClass = isMobile ? "mobile-buy-fab-trigger" : "buy-fab-trigger-desktop";

  return (
    <button
      type="button"
      className={triggerClass}
      aria-label="Comprar póster"
      title="Comprar póster"
      onClick={onClick}
    >
      <CartIcon />
      {!isMobile && <span>Comprar</span>}
    </button>
  );
}
