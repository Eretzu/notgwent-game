import ServerCard from '../../models/game/ServerCard'
import HeroNightMaiden from '../../cards/heroes/HeroNightMaiden'
import HeroSatia from '../../cards/heroes/HeroSatia'
import UnitPossessedVulture from '../../cards/units/UnitPossessedVulture'
import UnitRavenMessenger from '../../cards/units/UnitRavenMessenger'
import ServerGame from '../game/ServerGame'
import VoidGame from '../../utils/VoidGame'
import UnitMadBerserker from '../../cards/units/UnitMadBerserker'
import UnitForestScout from '../../cards/units/UnitForestScout'
import UnitTwinBowArcher from '../../cards/units/UnitTwinBowArcher'
import UnitUnfeelingWarrior from '../../cards/units/UnitUnfeelingWarrior'

export default class GameLibrary {
	static cards: any[]

	constructor() {
		const cards = [
			HeroNightMaiden,
			HeroSatia,
			UnitPossessedVulture,
			UnitRavenMessenger,
			UnitMadBerserker,
			UnitForestScout,
			UnitTwinBowArcher,
			UnitUnfeelingWarrior
		]

		GameLibrary.cards = cards.map(prototype => {
			const cardPrototype = new prototype(VoidGame.get())
			cardPrototype.cardClass = prototype.name.substr(0, 1).toLowerCase() + prototype.name.substr(1)
			cardPrototype.power = cardPrototype.basePower
			cardPrototype.attack = cardPrototype.baseAttack
			return cardPrototype
		})
	}

	public static createCard(card: ServerCard): ServerCard {
		const cardClass = card.constructor.name.substr(0, 1).toLowerCase() + card.constructor.name.substr(1)
		return this.createCardByClass(card.game, cardClass)
	}

	public static createCardByClass(game: ServerGame, cardClass: string): ServerCard {
		const original = GameLibrary.cards.find(card => {
			return card.cardClass === cardClass
		})
		if (!original) {
			throw new Error(`No registered card with class '${cardClass}'!`)
		}
		const clone: ServerCard = new original.constructor()
		clone.cardClass = cardClass
		clone.cardName = `card.name.${cardClass}`
		clone.cardTitle = `card.title.${cardClass}`
		clone.cardTribes = (original.cardTribes || []).slice()
		clone.cardDescription = `card.description.${cardClass}`
		clone.game = game
		clone.power = clone.basePower
		clone.attack = clone.baseAttack
		return clone
	}
}
