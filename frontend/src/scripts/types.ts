export interface Card {
    value: string;
    suit: string;
    image: string;
    hidden: boolean;
    flipping?: boolean; //Special case for dealer's second card
}