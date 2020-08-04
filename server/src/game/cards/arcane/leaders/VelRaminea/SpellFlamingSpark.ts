import CardType from '@shared/enums/CardType'
import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'
import SimpleTargetDefinitionBuilder from '../../../../models/targetDefinitions/SimpleTargetDefinitionBuilder'
import TargetDefinitionBuilder from '../../../../models/targetDefinitions/TargetDefinitionBuilder'
import ServerUnit from '../../../../models/ServerUnit'
import ServerDamageInstance from '../../../../models/ServerDamageSource'
import CardColor from '@shared/enums/CardColor'
import TargetMode from '@shared/enums/TargetMode'
import TargetType from '@shared/enums/TargetType'
import BuffSparksExtraDamage from '../../../../buffs/BuffSparksExtraDamage'
import CardFeature from '@shared/enums/CardFeature'
import CardFaction from '@shared/enums/CardFaction'
import ServerAnimation from '../../../../models/ServerAnimation'
import BuffVelRamineaWeave from '../../../../buffs/BuffVelRamineaWeave'
import CardLocation from '@shared/enums/CardLocation'
import {CardTargetSelectedEventArgs} from '../../../../models/GameEventCreators'
import GameEventType from '@shared/enums/GameEventType'

export default class SpellFlamingSpark extends ServerCard {
	baseDamage = 2
	damagePerWeave = 1

	constructor(game: ServerGame) {
		super(game, CardType.SPELL, CardColor.GOLDEN, CardFaction.EXPERIMENTAL)

		this.basePower = 2
		this.baseFeatures = [CardFeature.HERO_POWER]
		this.dynamicTextVariables = {
			damage: () => this.damage,
			damagePerWeave: this.damagePerWeave
		}

		this.createEffect<CardTargetSelectedEventArgs>(GameEventType.CARD_TARGET_SELECTED)
			.perform(({ targetUnit }) => this.onTargetSelected(targetUnit))
	}

	get damage() {
		return this.baseDamage
			+ this.game.getTotalBuffIntensityForPlayer(BuffSparksExtraDamage, this.owner)
			+ this.game.getTotalBuffIntensityForPlayer(BuffVelRamineaWeave, this.owner, [CardLocation.LEADER])
	}

	definePostPlayRequiredTargets(): TargetDefinitionBuilder {
		return SimpleTargetDefinitionBuilder.base(this.game, TargetMode.POST_PLAY_REQUIRED_TARGET)
			.singleTarget()
			.allow(TargetType.UNIT)
			.enemyUnit()
	}

	private onTargetSelected(target: ServerUnit): void {
		this.game.animation.play(ServerAnimation.universeAttacksUnits([target]))
		target.dealDamage(ServerDamageInstance.fromCard(this.damage, this))
	}
}