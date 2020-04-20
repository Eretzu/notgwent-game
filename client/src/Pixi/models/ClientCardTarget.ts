import Core from '@/Pixi/Core'
import RenderedUnit from '@/Pixi/board/RenderedUnit'
import RenderedGameBoardRow from '@/Pixi/board/RenderedGameBoardRow'
import CardTarget from '@shared/models/CardTarget'
import CardTargetMessage from '@shared/models/network/CardTargetMessage'
import TargetMode from '@shared/enums/TargetMode'
import TargetType from '@shared/enums/TargetType'
import Card from '@shared/models/Card'
import ClientPlayerInGame from '@/Pixi/models/ClientPlayerInGame'

export default class ClientCardTarget implements CardTarget {
	targetMode: TargetMode
	targetType: TargetType
	sourceCard?: Card
	sourceCardOwner?: ClientPlayerInGame
	sourceUnit?: RenderedUnit
	targetCard?: Card
	targetUnit?: RenderedUnit
	targetRow?: RenderedGameBoardRow
	targetLabel: string

	constructor(targetMode: TargetMode, targetType: TargetType) {
		this.targetMode = targetMode
		this.targetType = targetType
	}

	public static fromMessage(message: CardTargetMessage): ClientCardTarget {
		const target = new ClientCardTarget(message.targetMode, message.targetType)
		if (message.sourceCardId) {
			target.sourceCard = Core.game.findCardById(message.sourceCardId)
		}
		if (message.sourceCardOwnerId) {
			target.sourceCardOwner = Core.getPlayer(message.sourceCardOwnerId)
		}
		if (message.sourceUnitId) {
			target.sourceUnit = Core.board.findUnitById(message.sourceUnitId)
		}
		if (message.targetCardId) {
			target.targetCard = Core.game.findCardById(message.sourceCardId)
		}
		if (message.targetUnitId) {
			target.targetUnit = Core.board.findUnitById(message.targetUnitId)
		}
		if (message.targetRowIndex !== -1) {
			target.targetRow = Core.board.rows[message.targetRowIndex]
		}
		target.targetLabel = message.targetLabel
		return target
	}
}
