import Card from './Card'
import PlayerInGame from './PlayerInGame'

export default class CardOnBoard {
	card: Card
	owner: PlayerInGame

	constructor(card: Card, owner: PlayerInGame) {
		this.card = card
		this.owner = owner
	}
}
