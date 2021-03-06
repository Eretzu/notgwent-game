import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardFaction from '@shared/enums/CardFaction'
import ServerUnit from '../../../models/ServerUnit'
import TargetType from '@shared/enums/TargetType'
import GameEventType from '@shared/enums/GameEventType'
import CardFeature from '@shared/enums/CardFeature'
import ExpansionSet from '@shared/enums/ExpansionSet'
import BuffStrength from '../../../buffs/BuffStrength'
import {asSoloBuffPotency} from '../../../../utils/LeaderStats'

export default class UnitTravelingEnchantress extends ServerCard {
	baseStrengthGiven = asSoloBuffPotency(2)

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.NEUTRAL,
			features: [CardFeature.KEYWORD_DEPLOY, CardFeature.KEYWORD_BUFF_STRENGTH],
			stats: {
				power: 5,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			baseStrengthGiven: this.baseStrengthGiven
		}

		this.createDeployEffectTargets()
			.target(TargetType.UNIT)
			.requireAlliedUnit()
			.requireNotSelf()

		this.createEffect(GameEventType.CARD_TARGET_SELECTED_UNIT)
			.perform(({ targetUnit }) => this.onTargetSelected(targetUnit))
	}

	private onTargetSelected(target: ServerUnit): void {
		target.buffs.addMultiple(BuffStrength, this.baseStrengthGiven, this)
		const strengthIntensity = target.buffs.getIntensity(BuffStrength)
		this.game.animation.syncAnimationThreads()
		target.buffs.addMultiple(BuffStrength, strengthIntensity, this)
	}
}
