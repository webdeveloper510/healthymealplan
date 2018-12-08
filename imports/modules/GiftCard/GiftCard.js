import GiftCards from '../../api/GiftCards/GiftCards';

export default class GiftCard {

  details = null;

  init(giftCardId) {
    const giftCard = GiftCards.findOne({ _id: giftCardId });
    if (giftCard) {
      this.details = giftCard;
    } else {
      throw new Error('Gift card not found');
    }
  }

  getBalance() {
    if (!details) {
      throw new Error('Gift card not initialized');
    }

    return this.details.balance;
  }

  isDepleted() {
    return details.isDepleted;
  }

  deductAmount(amount) {
    if (this.isDepleted()) {
      throw new Error('Gift card is depleted. Cannot deduct amount.')
    }

    if (amount <= 0) {
      throw new Error('Cannot deduct amount when it is zero or less than zero.')
    }

    if (details.balance < amount) {
      throw new Error('Gift card does not have sufficient balance.')
    }

    const difference = this.details.balance - amount;

    GiftCards.update({
      _id: this.details._id,
    }, {
        $set: {
          balance: difference,
        }
      });

    if (difference == 0) {
      this.deplete();
    }
  }

  deplete() {
    GiftCards.update({
      _id: this.details._id,
    }, {
        $set: {
          balance: 0,
          isDepleted: true,
        }
      });
  }
}