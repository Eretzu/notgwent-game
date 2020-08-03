import ServerBuff from '../models/ServerBuff'
import BuffStackType from '@shared/enums/BuffStackType'
import ServerGame from '../models/ServerGame'
import {CardDrawnEventArgs, CardPlayedEventArgs} from '../models/GameEventCreators'
import GameEventType from '@shared/enums/GameEventType'
import CardType from '@shared/enums/CardType'
import CardLocation from '@shared/enums/CardLocation'
import ServerCard from '../models/ServerCard'
import ServerAnimation from '../models/ServerAnimation'
import BuffAlignment from '@shared/enums/BuffAlignment'
import BuffSpellDiscountSingular from './BuffSpellDiscountSingular'

export default class BuffSpellDiscountAura extends ServerBuff {
	constructor(game: ServerGame) {
		super(game, BuffStackType.ADD_INTENSITY)

		this.createCallback<CardPlayedEventArgs>(GameEventType.CARD_PLAYED)
			.require(({ triggeringCard }) => triggeringCard.type === CardType.SPELL)
			.require(({ triggeringCard }) => triggeringCard.owner === this.card.owner)
			.perform(() => this.onAlliedSpellPlayed())

		this.createCallback<CardDrawnEventArgs>(GameEventType.CARD_DRAWN)
			.requireLocation(CardLocation.LEADER)
			.require(({ triggeringCard }) => triggeringCard.owner === this.card.owner)
			.perform(({ triggeringCard }) => this.onNewCardDrawn(triggeringCard))
	}

	private onAlliedSpellPlayed(): void {
		this.card.buffs.removeByReference(this)
	}

	private onNewCardDrawn(card: ServerCard): void {
		card.buffs.addMultiple(BuffSpellDiscountSingular, this.intensity, this.source)
		this.game.animation.play(ServerAnimation.cardReceivedBuff([card], BuffAlignment.POSITIVE))
	}
}
