import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardTribe from '@shared/enums/CardTribe'
import CardFaction from '@shared/enums/CardFaction'
import CardLocation from '@shared/enums/CardLocation'
import GameEventType from '@shared/enums/GameEventType'
import {CardPlayedEventArgs} from '../../../models/GameEventCreators'

export default class UnitArcaneCrystal extends ServerCard {
	charges = 0
	manaGenerated = 1
	chargePerMana = 1
	chargesForMana = 3

	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.TOKEN, CardFaction.ARCANE)
		this.basePower = 4
		this.baseTribes = [CardTribe.CRYSTAL]
		this.dynamicTextVariables = {
			manaGenerated: this.manaGenerated,
			chargePerMana: this.chargePerMana,
			chargesForMana: this.chargesForMana,
			charges: () => this.charges,
			potentialMana: () => Math.floor(this.charges / this.chargesForMana) * this.manaGenerated,
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
		this.unit.owner.addSpellMana(Math.floor(this.charges / this.chargesForMana) * this.manaGenerated)
	}
}