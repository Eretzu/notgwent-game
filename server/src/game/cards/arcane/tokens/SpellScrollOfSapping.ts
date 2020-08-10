import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import TargetDefinitionBuilder from '../../../models/targetDefinitions/TargetDefinitionBuilder'
import ServerUnit from '../../../models/ServerUnit'
import CardColor from '@shared/enums/CardColor'
import TargetType from '@shared/enums/TargetType'
import CardFaction from '@shared/enums/CardFaction'
import PostPlayTargetDefinitionBuilder from '../../../models/targetDefinitions/PostPlayTargetDefinitionBuilder'
import ServerAnimation from '../../../models/ServerAnimation'
import {CardTargetSelectedEventArgs} from '../../../models/GameEventCreators'
import GameEventType from '@shared/enums/GameEventType'
import CardTribe from '@shared/enums/CardTribe'
import CardFeature from '@shared/enums/CardFeature'

export default class SpellScrollOfSapping extends ServerCard {
	constructor(game: ServerGame) {
		super(game, CardType.SPELL, CardColor.TOKEN, CardFaction.ARCANE)

		this.basePower = 2
		this.baseTribes = [CardTribe.SCROLL]
		this.baseFeatures = [CardFeature.KEYWORD_BUFF_TEMPORARY_CARD]

		this.createEffect<CardTargetSelectedEventArgs>(GameEventType.CARD_TARGET_SELECTED)
			.perform(({ targetUnit }) => this.onTargetSelected(targetUnit))
	}

	definePostPlayRequiredTargets(): TargetDefinitionBuilder {
		return PostPlayTargetDefinitionBuilder.base(this.game)
			.singleTarget()
			.allow(TargetType.UNIT)
	}

	private onTargetSelected(target: ServerUnit): void {
		this.game.animation.play(ServerAnimation.universeAffectsCards([target.card]))
		this.game.board.sapUnit(target, this)
	}
}
