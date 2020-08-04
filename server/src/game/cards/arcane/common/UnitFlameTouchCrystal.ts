import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardTribe from '@shared/enums/CardTribe'
import CardLibrary from '../../../libraries/CardLibrary'
import UnitTinySparkling from '../tokens/UnitTinySparkling'
import CardFaction from '@shared/enums/CardFaction'
import CardLocation from '@shared/enums/CardLocation'
import GameEventType from '@shared/enums/GameEventType'
import {CardPlayedEventArgs} from '../../../models/GameEventCreators'

export default class UnitFlameTouchCrystal extends ServerCard {
	charges = 0
	chargePerMana = 1

	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.TOKEN, CardFaction.ARCANE)
		this.basePower = 4
		this.baseTribes = [CardTribe.CRYSTAL]
		this.dynamicTextVariables = {
			chargePerMana: this.chargePerMana,
			charges: () => this.charges,
			chargesVisible: () => !!this.unit
		}

		this.createCallback(GameEventType.UNIT_DESTROYED, [CardLocation.BOARD])
			.require(({ targetUnit }) => targetUnit.card === this)
			.perform(() => this.onDestroy())

		this.createCallback<CardPlayedEventArgs>(GameEventType.CARD_PLAYED, [CardLocation.BOARD])
			.require(({ triggeringCard }) => triggeringCard.type === CardType.SPELL)
			.perform(({ triggeringCard }) => this.onSpellPlayed(triggeringCard))
	}

	private onSpellPlayed(spell: ServerCard): void {
		this.charges += spell.spellCost
	}

	private onDestroy(): void {
		const thisUnit = this.unit
		for (let i = 0; i < this.charges; i++) {
			const sparkling = CardLibrary.instantiateByConstructor(this.game, UnitTinySparkling)
			this.game.board.createUnit(sparkling, thisUnit.owner, thisUnit.rowIndex, thisUnit.unitIndex)
		}
	}
}