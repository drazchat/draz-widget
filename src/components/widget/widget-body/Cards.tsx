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
    <div className="w-full flex flex-col gap-3 mt-1">
      {cards.map((card, cardIndex) => (
        <div
          key={cardIndex}
          className="bg-gray-100 rounded-xl overflow-hidden"
        >
          {/* Card Image */}
          {card.image && (
            <div className="w-full h-40 overflow-hidden">
              <img
                src={card.image}
                alt={card.title}
                className="w-full h-full object-cover p-4 rounded-3xl"
              />
            </div>
          )}

          {/* Card Content */}
          <div className="px-0">
            <div className="px-4">
              <h4
                className={`font-medium ${getFontSizeClass(
                  config.fontSize
                )} text-gray-900`}
              >
                {card.title}
              </h4>
              {card.description && (
                <p
                  className={`text-gray-600 mt-1 mb-4 ${getFontSizeClass(
                    config.fontSize
                  )}`}
                >
                  {card.description}
                </p>
              )}
            </div>

            {/* Card Options/Buttons */}
            {card.options && card.options.length > 0 && (
              <div className="flex flex-col gap-0">
                {card.options.map((option, optIndex) => (
                  <button
                    key={optIndex}
                    onClick={() =>
                      handleOptionClick(option.label, option.value)
                    }
                    className={`px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer border-t border-gray-200 max-w-full last:py-3 ${getFontSizeClass(
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
