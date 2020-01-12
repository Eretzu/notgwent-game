import ServerCard from '../../models/game/ServerCard'
import ServerPlayer from '../../libraries/players/ServerPlayer'
import CardMessage from '../../shared/models/network/CardMessage'
import ServerCardOnBoard from '../../libraries/game/ServerCardOnBoard'
import CardOnBoardMessage from '../../shared/models/CardOnBoardMessage'
import QueuedCardAttack from '../../shared/models/QueuedCardAttack'

export default {
	notifyAboutUnitCreated(player: ServerPlayer, card: ServerCardOnBoard, rowIndex: number, unitIndex: number) {
		player.sendMessage({
			type: 'update/board/cardCreated',
			data: CardOnBoardMessage.fromCardOnBoard(card, rowIndex, unitIndex)
		})
	},

	notifyAboutUnitDestroyed(player: ServerPlayer, cardOnBoard: ServerCardOnBoard) {
		player.sendMessage({
			type: 'update/board/cardDestroyed',
			data: CardMessage.fromCard(cardOnBoard.card)
		})
	},

	notifyAboutCardAttackChange(player: ServerPlayer, card: ServerCard) {
		player.sendMessage({
			type: 'update/board/card/attack',
			data: CardMessage.fromCard(card)
		})
	},

	notifyAboutCardHealthChange(player: ServerPlayer, card: ServerCard) {
		player.sendMessage({
			type: 'update/board/card/health',
			data: CardMessage.fromCard(card)
		})
	},

	notifyAboutCardInitiativeChange(player: ServerPlayer, card: ServerCard) {
		player.sendMessage({
			type: 'update/board/card/initiative',
			data: CardMessage.fromCard(card)
		})
	}
}
