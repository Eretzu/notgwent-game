import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardFaction from '@shared/enums/CardFaction'
import TargetDefinitionBuilder from '../../../models/targetDefinitions/TargetDefinitionBuilder'
import PostPlayTargetDefinitionBuilder from '../../../models/targetDefinitions/PostPlayTargetDefinitionBuilder'
import TargetType from '@shared/enums/TargetType'
import {
	CardTargetsConfirmedEventArgs,
	CardTargetSelectedEventArgs,
	UnitDeployedEventArgs
} from '../../../models/GameEventCreators'
import GameEventType from '@shared/enums/GameEventType'
import CardFeature from '@shared/enums/CardFeature'
import CardLibrary from '../../../libraries/CardLibrary'
import BuffDuration from '@shared/enums/BuffDuration'
import CardTribe from '@shared/enums/CardTribe'
import TargetDefinition from '../../../models/targetDefinitions/TargetDefinition'
import BuffSpellDiscount from '../../../buffs/BuffSpellDiscount'

export default class UnitHungrySpellslinger extends ServerCard {
	infuseCost = 3
	spellDiscount = 3
	didInfuse = false

	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.BRONZE, CardFaction.ARCANE)
		this.basePower = 5
		this.baseTribes = [CardTribe.ELEMENTAL]
		this.baseFeatures = [CardFeature.KEYWORD_INFUSE_X]
		this.dynamicTextVariables = {
			infuseCost: this.infuseCost,
			spellDiscount: this.spellDiscount
		}

		this.createEffect<UnitDeployedEventArgs>(GameEventType.UNIT_DEPLOYED)
			.perform(() => this.infuse())

		this.createEffect<CardTargetSelectedEventArgs>(GameEventType.CARD_TARGET_SELECTED)
			.perform(({ targetCard }) => this.onTargetSelected(targetCard))

		this.createEffect<CardTargetsConfirmedEventArgs>(GameEventType.CARD_TARGETS_CONFIRMED)
			.perform(() => this.onTargetsConfirmed())
	}

	private infuse(): void {
		if (this.owner.spellMana < this.infuseCost) {
			return
		}
		this.owner.addSpellMana(-this.infuseCost)
		this.didInfuse = true
	}

	definePostPlayRequiredTargets(): TargetDefinitionBuilder {
		if (!this.didInfuse) {
			return TargetDefinition.none(this.game)
		}
		return PostPlayTargetDefinitionBuilder.base(this.game)
			.singleTarget()
			.require(TargetType.CARD_IN_LIBRARY)
			.validate(TargetType.CARD_IN_LIBRARY, (args => args.targetCard.tribes.includes(CardTribe.SCROLL)))
	}

	private onTargetSelected(target: ServerCard): void {
		const newCard = CardLibrary.instantiateByInstance(this.game, target)
		newCard.buffs.addMultiple(BuffSpellDiscount, this.spellDiscount, this, BuffDuration.INFINITY)
		this.owner.cardHand.addSpell(newCard)
	}

	private onTargetsConfirmed(): void {
		this.didInfuse = false
	}
}
