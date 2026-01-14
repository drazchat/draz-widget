import { useSocket, useWidgetConfig } from "@/context";
import type { Card } from "@/context";
import { getFontSizeClass } from "@/lib/font-utils";

interface CardsProps {
  cards: Card[];
}

const Cards = ({ cards }: CardsProps) => {
  const { sendMessage } = useSocket();
  const { config } = useWidgetConfig();

  if (!cards || cards.length === 0) return null;

  const handleOptionClick = (label: string, value?: string) => {
    // Show label in chat UI, but send value (or label if no value) to socket
    sendMessage(label, value || label);
  };

  return (
    <div className="dz:w-full dz:flex dz:flex-col dz:gap-3 dz:mt-1">
      {cards.map((card, cardIndex) => (
        <div
          key={cardIndex}
          className="dz:bg-gray-100 dz:rounded-xl dz:overflow-hidden"
        >
          {/* Card Image */}
          {card.image && (
            <div className="dz:w-full dz:h-40 dz:overflow-hidden">
              <img
                src={card.image}
                alt={card.title}
                className="dz:w-full dz:h-full dz:object-cover dz:p-4 dz:rounded-3xl"
              />
            </div>
          )}

          {/* Card Content */}
          <div className="dz:px-0">
            <div className="dz:px-4">
              <h4
                className={`dz:font-medium ${getFontSizeClass(
                  config.fontSize
                )} dz:text-gray-900`}
              >
                {card.title}
              </h4>
              {card.description && (
                <p
                  className={`dz:text-gray-600 dz:mt-1 dz:mb-4 ${getFontSizeClass(
                    config.fontSize
                  )}`}
                >
                  {card.description}
                </p>
              )}
            </div>

            {/* Card Options/Buttons */}
            {card.options && card.options.length > 0 && (
              <div className="dz:flex dz:flex-col dz:gap-0">
                {card.options.map((option, optIndex) => (
                  <button
                    key={optIndex}
                    onClick={() =>
                      handleOptionClick(option.label, option.value)
                    }
                    className={`dz:px-4 dz:py-2 dz:bg-gray-100 dz:text-gray-700 hover:dz:bg-gray-200 dz:transition-colors dz:cursor-pointer dz:border-t dz:border-gray-200 dz:max-w-full last:dz:py-3 ${getFontSizeClass(
                      config.fontSize
                    )}`}
                    title={option.label}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Cards;
