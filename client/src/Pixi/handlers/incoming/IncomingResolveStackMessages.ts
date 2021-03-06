import {IncomingMessageHandlerFunction} from '@/Pixi/handlers/IncomingMessageHandlers'
import Core from '@/Pixi/Core'
import {ResolveStackMessageType} from '@shared/models/network/messageHandlers/ServerToClientMessageTypes'
import RenderedCard from '@/Pixi/cards/RenderedCard'
import CardTargetMessage from '@shared/models/network/CardTargetMessage'
import ClientCardTarget from '@/Pixi/models/ClientCardTarget'
import CardRefMessage from '@shared/models/network/card/CardRefMessage'
import CardMessage from '@shared/models/network/card/CardMessage'
import OwnedCardMessage from '@shared/models/network/ownedCard/OwnedCardMessage'
import store from '@/Vue/store'
import ResolvingCardTargetsMessage from '@shared/models/network/ResolvingCardTargetsMessage'

const IncomingResolveStackMessages: {[ index in ResolveStackMessageType ]: IncomingMessageHandlerFunction } = {
	[ResolveStackMessageType.ADD]: (data: OwnedCardMessage) => {
		Core.resolveStack.addCard(RenderedCard.fromMessage(data.card), Core.getPlayer(data.owner.player.id))
	},

	[ResolveStackMessageType.TARGETS]: (data: ResolvingCardTargetsMessage) => {
		const validTargets = data.targets.map(data => ClientCardTarget.fromMessage(data))
		if (validTargets.length > 0) {
			Core.input.enableForcedTargetingMode(data.targetMode, validTargets)
		} else {
			Core.input.disableForcedTargetingMode()
		}
	},

	[ResolveStackMessageType.REMOVE]: (data: CardRefMessage) => {
		Core.resolveStack.destroyCardById(data.id)
		if (Core.resolveStack.isEmpty()) {
			Core.input.disableForcedTargetingMode()
		}
	},
}

export default IncomingResolveStackMessages
